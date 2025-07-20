#!/usr/bin/env node

import { Pool, PoolClient } from 'pg';
import sgMail from '@sendgrid/mail';
import { db } from './db';
import { emailNotificationQueue, emailNotificationLog } from '@shared/schema';
import { eq, and, lte } from 'drizzle-orm';

// Initialize SendGrid with API key when available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export class EmailWorker {
  private pool: Pool;
  private client: PoolClient | null = null;
  private isProcessing = false;
  private legacyPollInterval: NodeJS.Timeout | null = null;
  private backoffDelay = 1000; // Start with 1 second
  private maxBackoffDelay = 30000; // Max 30 seconds
  private isShuttingDown = false;

  constructor() {
    // Create shared connection pool
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Setup graceful shutdown
    process.on('SIGTERM', this.shutdown.bind(this));
    process.on('SIGINT', this.shutdown.bind(this));
  }

  async start(legacyPoll = false) {
    console.log('📧 Starting Email Worker...');

    if (legacyPoll) {
      console.log('⚠️  Running in legacy polling mode');
      this.startLegacyPolling();
    } else {
      console.log('🔔 Using PostgreSQL LISTEN/NOTIFY mode');
      await this.startNotificationListener();
    }

    // Process any existing pending emails on startup
    await this.processQueue();
  }

  private async startNotificationListener() {
    try {
      this.client = await this.pool.connect();
      
      // Listen for email queue notifications
      await this.client.query('LISTEN email_queue');
      console.log('👂 Listening for email_queue notifications');

      this.client.on('notification', async (msg) => {
        if (msg.channel === 'email_queue' && !this.isProcessing) {
          console.log('🔔 Received email queue notification:', msg.payload);
          await this.processQueue();
        }
      });

      // Fallback: process queue every 5 minutes in case notifications fail
      setInterval(() => {
        if (!this.isProcessing) {
          this.processQueue().catch(console.error);
        }
      }, 5 * 60 * 1000);

    } catch (error) {
      console.error('❌ Failed to setup LISTEN/NOTIFY, falling back to polling:', error);
      this.startLegacyPolling();
    }
  }

  private startLegacyPolling() {
    const pollWithBackoff = async () => {
      if (this.isShuttingDown) return;

      try {
        await this.processQueue();
        
        // Reset backoff on success
        this.backoffDelay = 1000;
        
        // Schedule next poll
        this.legacyPollInterval = setTimeout(pollWithBackoff, 60000); // 1 minute
        
      } catch (error) {
        console.error('❌ Error in legacy polling, backing off:', error);
        
        // Exponential backoff
        this.backoffDelay = Math.min(this.backoffDelay * 2, this.maxBackoffDelay);
        console.log(`⏱️  Backing off for ${this.backoffDelay}ms`);
        
        this.legacyPollInterval = setTimeout(pollWithBackoff, this.backoffDelay);
      }
    };

    pollWithBackoff();
  }

  private async processQueue() {
    if (this.isProcessing || this.isShuttingDown) return;

    this.isProcessing = true;
    
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.log('⚠️  SendGrid API key not configured, skipping email processing');
        return;
      }

      // Use raw SQL with pool for better performance and covering index
      const poolClient = await this.pool.connect();
      try {
        const result = await poolClient.query(`
          SELECT id, recipient_email, recipient_user_id, template_code, subject, 
                 body_html, body_text, variables, priority, status, attempts, 
                 sent_at, failed_at, error_message, created_at
          FROM email_notification_queue 
          WHERE status = $1 AND attempts <= $2
          ORDER BY priority ASC, created_at ASC
          LIMIT $3
        `, ['pending', 3, 10]);

        console.log(`📨 Found ${result.rows.length} pending emails`);

        for (const email of result.rows) {
          await this.sendEmail(email);
        }

        if (result.rows.length > 0) {
          console.log(`✅ Processed ${result.rows.length} emails`);
        }

      } finally {
        poolClient.release();
      }

    } catch (error) {
      console.error('❌ Error processing email queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async sendEmail(email: any) {
    const poolClient = await this.pool.connect();
    
    try {
      console.log(`📤 Sending email to ${email.recipient_email}`);

      // Update status to sending
      await poolClient.query(`
        UPDATE email_notification_queue 
        SET status = $1, attempts = $2 
        WHERE id = $3
      `, ['sending', email.attempts + 1, email.id]);

      // Prepare email message
      const msg = {
        to: email.recipient_email,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@artsouk.com',
        subject: email.subject,
        html: email.body_html,
        text: email.body_text || undefined,
      };

      // Send via SendGrid
      const [response] = await sgMail.send(msg);
      const messageId = response.headers['x-message-id'];

      // Update queue status to sent
      await poolClient.query(`
        UPDATE email_notification_queue 
        SET status = $1, sent_at = $2 
        WHERE id = $3
      `, ['sent', new Date(), email.id]);

      // Log the sent email using Drizzle for consistency
      await db.insert(emailNotificationLog).values({
        queueId: email.id,
        recipientEmail: email.recipient_email,
        recipientUserId: email.recipient_user_id,
        templateCode: email.template_code,
        subject: email.subject,
        status: 'sent',
        sendgridMessageId: messageId,
        sendgridResponse: response,
      });

      console.log(`✅ Email sent successfully to ${email.recipient_email}`);
      console.log(`📊 Worker processed 1 email`);

    } catch (error: any) {
      console.error(`❌ Error sending email to ${email.recipient_email}:`, error);

      // Update queue with failure
      await poolClient.query(`
        UPDATE email_notification_queue 
        SET status = $1, failed_at = $2, error_message = $3 
        WHERE id = $4
      `, [
        email.attempts >= 3 ? 'failed' : 'pending',
        new Date(),
        error.message || 'Unknown error',
        email.id
      ]);

      // Log the failure using Drizzle for consistency
      await db.insert(emailNotificationLog).values({
        queueId: email.id,
        recipientEmail: email.recipient_email,
        recipientUserId: email.recipient_user_id,
        templateCode: email.template_code,
        subject: email.subject,
        status: 'failed',
        sendgridResponse: error.response?.body || error,
      });

    } finally {
      poolClient.release();
    }
  }

  async getQueueStats() {
    const poolClient = await this.pool.connect();
    try {
      const result = await poolClient.query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'pending') as pending,
          COUNT(*) FILTER (WHERE status = 'sending') as sending,
          COUNT(*) FILTER (WHERE status = 'sent') as sent,
          COUNT(*) FILTER (WHERE status = 'failed') as failed,
          COUNT(*) as total
        FROM email_notification_queue
      `);
      return result.rows[0];
    } finally {
      poolClient.release();
    }
  }

  private async shutdown() {
    console.log('🛑 Shutting down Email Worker...');
    this.isShuttingDown = true;

    // Stop legacy polling
    if (this.legacyPollInterval) {
      clearTimeout(this.legacyPollInterval);
    }

    // Close notification listener
    if (this.client) {
      try {
        await this.client.query('UNLISTEN email_queue');
        this.client.release();
      } catch (error) {
        console.error('Error closing notification listener:', error);
      }
    }

    // Close pool
    try {
      await this.pool.end();
      console.log('✅ Email Worker shutdown complete');
    } catch (error) {
      console.error('Error closing database pool:', error);
    }

    process.exit(0);
  }
}

// CLI execution - ES module compatible
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.argv[1] === __filename) {
  const worker = new EmailWorker();
  const legacyMode = process.argv.includes('--legacy-poll');
  
  worker.start(legacyMode).catch((error) => {
    console.error('❌ Failed to start email worker:', error);
    process.exit(1);
  });
}