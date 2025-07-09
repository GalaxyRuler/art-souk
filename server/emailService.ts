import sgMail from '@sendgrid/mail';
import { db } from './db';
import { 
  emailNotificationQueue, 
  emailNotificationLog,
  emailTemplates,
  newsletterSubscribers,
  type InsertEmailNotificationQueue,
  type EmailTemplate
} from '@shared/schema';
import { eq, and, lte, or, isNull } from 'drizzle-orm';

// Initialize SendGrid with API key when available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export class EmailService {
  private static instance: EmailService;
  private processingInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Start processing emails every minute
    this.startProcessing();
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private startProcessing() {
    // Process emails every minute
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, 60000); // 1 minute
  }

  stopProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  // Queue an email for sending
  async queueEmail(emailData: Omit<InsertEmailNotificationQueue, 'id' | 'createdAt'>) {
    try {
      const [queued] = await db.insert(emailNotificationQueue).values(emailData).returning();
      
      // Process immediately if high priority
      if (emailData.priority && emailData.priority <= 3) {
        this.processQueue();
      }
      
      return queued;
    } catch (error) {
      console.error('Error queuing email:', error);
      throw error;
    }
  }

  // Queue email using a template
  async queueTemplatedEmail(
    recipientEmail: string,
    templateCode: string,
    variables: Record<string, any> = {},
    options: {
      recipientUserId?: string;
      priority?: number;
      language?: 'en' | 'ar';
    } = {}
  ) {
    try {
      // Get the template
      const [template] = await db
        .select()
        .from(emailTemplates)
        .where(and(
          eq(emailTemplates.templateCode, templateCode),
          eq(emailTemplates.isActive, true)
        ));

      if (!template) {
        throw new Error(`Email template not found: ${templateCode}`);
      }

      // Use Arabic version if language is Arabic
      const isArabic = options.language === 'ar';
      const subject = isArabic && template.subjectAr ? template.subjectAr : template.subject;
      const bodyHtml = isArabic && template.bodyHtmlAr ? template.bodyHtmlAr : template.bodyHtml;
      const bodyText = isArabic && template.bodyTextAr ? template.bodyTextAr : template.bodyText || undefined;

      // Replace variables in the template
      const processedSubject = this.replaceVariables(subject, variables);
      const processedBodyHtml = this.replaceVariables(bodyHtml, variables);
      const processedBodyText = bodyText ? this.replaceVariables(bodyText, variables) : undefined;

      return await this.queueEmail({
        recipientEmail,
        recipientUserId: options.recipientUserId,
        templateCode,
        subject: processedSubject,
        bodyHtml: processedBodyHtml,
        bodyText: processedBodyText,
        variables,
        priority: options.priority,
      });
    } catch (error) {
      console.error('Error queuing templated email:', error);
      throw error;
    }
  }

  // Replace variables in template content
  private replaceVariables(content: string, variables: Record<string, any>): string {
    let processed = content;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, String(value));
    });
    
    return processed;
  }

  // Process queued emails
  private async processQueue() {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('SendGrid API key not configured, skipping email processing');
      return;
    }

    try {
      // Get pending emails (max 10 at a time)
      const pendingEmails = await db
        .select()
        .from(emailNotificationQueue)
        .where(and(
          eq(emailNotificationQueue.status, 'pending'),
          lte(emailNotificationQueue.attempts, 3)
        ))
        .orderBy(emailNotificationQueue.priority)
        .limit(10);

      for (const email of pendingEmails) {
        await this.sendEmail(email);
      }
    } catch (error) {
      console.error('Error processing email queue:', error);
    }
  }

  // Send an individual email
  private async sendEmail(email: typeof emailNotificationQueue.$inferSelect) {
    try {
      // Update status to sending
      await db
        .update(emailNotificationQueue)
        .set({ 
          status: 'sending',
          attempts: email.attempts + 1 
        })
        .where(eq(emailNotificationQueue.id, email.id));

      // Prepare email message
      const msg = {
        to: email.recipientEmail,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@artsouk.com',
        subject: email.subject,
        html: email.bodyHtml,
        text: email.bodyText || undefined,
      };

      // Send via SendGrid
      const [response] = await sgMail.send(msg);
      const messageId = response.headers['x-message-id'];

      // Update queue status
      await db
        .update(emailNotificationQueue)
        .set({ 
          status: 'sent',
          sentAt: new Date()
        })
        .where(eq(emailNotificationQueue.id, email.id));

      // Log the sent email
      await db.insert(emailNotificationLog).values({
        queueId: email.id,
        recipientEmail: email.recipientEmail,
        recipientUserId: email.recipientUserId,
        templateCode: email.templateCode,
        subject: email.subject,
        status: 'sent',
        sendgridMessageId: messageId,
        sendgridResponse: response,
      });

    } catch (error: any) {
      console.error('Error sending email:', error);

      // Update queue with failure
      await db
        .update(emailNotificationQueue)
        .set({ 
          status: email.attempts >= 3 ? 'failed' : 'pending',
          failedAt: new Date(),
          errorMessage: error.message || 'Unknown error'
        })
        .where(eq(emailNotificationQueue.id, email.id));

      // Log the failure
      await db.insert(emailNotificationLog).values({
        queueId: email.id,
        recipientEmail: email.recipientEmail,
        recipientUserId: email.recipientUserId,
        templateCode: email.templateCode,
        subject: email.subject,
        status: 'failed',
        sendgridResponse: error.response?.body || error,
      });
    }
  }

  // Send newsletter to subscribers
  async sendNewsletter(
    subject: string,
    bodyHtml: string,
    bodyText?: string,
    options: {
      categories?: string[];
      language?: 'en' | 'ar' | 'all';
    } = {}
  ) {
    try {
      // Build query for subscribers
      let query = db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.subscriptionStatus, 'active'));

      // Filter by language if specified
      if (options.language && options.language !== 'all') {
        query = query.where(eq(newsletterSubscribers.language, options.language));
      }

      const subscribers = await query;

      // Queue emails for each subscriber
      const queuePromises = subscribers.map(subscriber => 
        this.queueEmail({
          recipientEmail: subscriber.email,
          recipientUserId: subscriber.userId,
          subject,
          bodyHtml,
          bodyText,
          priority: 7, // Lower priority for newsletters
        })
      );

      await Promise.all(queuePromises);

      // Update last email sent timestamp
      await db
        .update(newsletterSubscribers)
        .set({ lastEmailSentAt: new Date() })
        .where(eq(newsletterSubscribers.subscriptionStatus, 'active'));

      return subscribers.length;
    } catch (error) {
      console.error('Error sending newsletter:', error);
      throw error;
    }
  }

  // Subscribe to newsletter
  async subscribeToNewsletter(
    email: string,
    options: {
      userId?: string;
      firstName?: string;
      lastName?: string;
      language?: string;
      categories?: string[];
      frequency?: string;
    } = {}
  ) {
    try {
      const [subscriber] = await db
        .insert(newsletterSubscribers)
        .values({
          email,
          userId: options.userId,
          firstName: options.firstName,
          lastName: options.lastName,
          language: options.language || 'en',
          categories: options.categories || [],
          frequency: options.frequency || 'weekly',
        })
        .onConflictDoUpdate({
          target: newsletterSubscribers.email,
          set: {
            subscriptionStatus: 'active',
            subscribedAt: new Date(),
            ...options
          }
        })
        .returning();

      // Send welcome email
      await this.queueTemplatedEmail(
        email,
        'welcome',
        {
          firstName: options.firstName || 'Subscriber',
        },
        {
          recipientUserId: options.userId,
          language: options.language as 'en' | 'ar',
        }
      );

      return subscriber;
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      throw error;
    }
  }

  // Unsubscribe from newsletter
  async unsubscribeFromNewsletter(email: string) {
    try {
      await db
        .update(newsletterSubscribers)
        .set({ 
          subscriptionStatus: 'unsubscribed',
          unsubscribedAt: new Date()
        })
        .where(eq(newsletterSubscribers.email, email));
    } catch (error) {
      console.error('Error unsubscribing from newsletter:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();