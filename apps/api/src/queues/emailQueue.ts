import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { MailService } from '@sendgrid/mail';

interface EmailJobData {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
}

export class EmailQueueService {
  private emailQueue: Queue<EmailJobData>;
  private redis: Redis;
  private mailService: MailService;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

    this.emailQueue = new Queue<EmailJobData>('email-processing', {
      connection: this.redis,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    });

    this.mailService = new MailService();
    if (process.env.SENDGRID_API_KEY) {
      this.mailService.setApiKey(process.env.SENDGRID_API_KEY);
    }

    this.setupWorker();
  }

  private setupWorker() {
    const worker = new Worker<EmailJobData>(
      'email-processing',
      async (job: Job<EmailJobData>) => {
        const { to, from, subject, html, text, templateId, dynamicTemplateData } = job.data;

        try {
          const emailData = templateId
            ? {
                to,
                from,
                templateId,
                dynamicTemplateData,
              }
            : {
                to,
                from,
                subject,
                html,
                text,
              };

          await this.mailService.send(emailData);

          console.log(`Email sent successfully to ${to}`);
          return { success: true, recipient: to };
        } catch (error) {
          console.error(`Failed to send email to ${to}:`, error);
          throw error;
        }
      },
      {
        connection: this.redis,
        concurrency: 5, // Process 5 emails concurrently
      }
    );

    worker.on('completed', (job) => {
      console.log(`Email job ${job.id} completed successfully`);
    });

    worker.on('failed', (job, err) => {
      console.error(`Email job ${job?.id} failed:`, err);
    });
  }

  async queueEmail(emailData: EmailJobData, priority: number = 0) {
    return this.emailQueue.add('send-email', emailData, {
      priority,
      delay: 0,
    });
  }

  async queueBulkEmails(emails: EmailJobData[], priority: number = 0) {
    const jobs = emails.map((email, index) => ({
      name: 'send-email',
      data: email,
      opts: {
        priority,
        delay: index * 100, // Stagger sends by 100ms
      },
    }));

    return this.emailQueue.addBulk(jobs);
  }

  async queueNewsletterEmail(
    recipientEmail: string,
    templateData: Record<string, any>,
    language: 'en' | 'ar' = 'en'
  ) {
    const templateId =
      language === 'ar'
        ? process.env.SENDGRID_NEWSLETTER_TEMPLATE_AR
        : process.env.SENDGRID_NEWSLETTER_TEMPLATE_EN;

    return this.queueEmail(
      {
        to: recipientEmail,
        from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@artsouk.com',
        subject: '', // Subject will be handled by template
        html: '', // HTML will be handled by template
        templateId,
        dynamicTemplateData: templateData,
      },
      1
    ); // Higher priority for newsletters
  }

  async queueBidNotification(
    recipientEmail: string,
    auctionTitle: string,
    currentBid: number,
    currency: string = 'SAR'
  ) {
    return this.queueEmail(
      {
        to: recipientEmail,
        from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@artsouk.com',
        subject: `You've been outbid on "${auctionTitle}"`,
        html: `
        <h2>Auction Update</h2>
        <p>Someone has placed a higher bid on the auction for "${auctionTitle}".</p>
        <p><strong>Current highest bid:</strong> ${currentBid} ${currency}</p>
        <p>Visit the auction page to place a new bid.</p>
        <a href="${process.env.FRONTEND_URL}/auctions" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Auction</a>
      `,
        text: `You've been outbid on "${auctionTitle}". Current highest bid: ${currentBid} ${currency}. Visit ${process.env.FRONTEND_URL}/auctions to place a new bid.`,
      },
      2
    ); // High priority for time-sensitive bid notifications
  }

  async getQueueStats() {
    const waiting = await this.emailQueue.getWaiting();
    const active = await this.emailQueue.getActive();
    const completed = await this.emailQueue.getCompleted();
    const failed = await this.emailQueue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  }
}

export const emailQueue = new EmailQueueService();
