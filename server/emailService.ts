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
import { welcomeEmailTemplates } from './emailTemplates/welcomeTemplates';

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

  // Send welcome email for new users
  async sendWelcomeEmail(user: any, userType: 'artist' | 'gallery' | 'collector') {
    try {
      const template = welcomeEmailTemplates[userType];
      if (!template) {
        console.error(`No welcome template found for user type: ${userType}`);
        return;
      }

      const personalizedContent = this.personalizeEmailContent(template.content, user);

      const emailData = {
        recipientEmail: user.email,
        recipientUserId: user.id,
        subject: template.subject,
        bodyHtml: personalizedContent,
        priority: 1, // High priority for welcome emails
      };

      await this.queueEmail(emailData);

      // Schedule follow-up emails if configured
      if (template.followUpSchedule) {
        for (const days of template.followUpSchedule) {
          await this.scheduleFollowUpEmail(user, userType, days);
        }
      }

      console.log(`Welcome email queued for ${userType}: ${user.email}`);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  // Personalize email content with user data
  private personalizeEmailContent(content: string, user: any): string {
    return content
      .replace(/{{firstName}}/g, user.firstName || 'Friend')
      .replace(/{{lastName}}/g, user.lastName || '')
      .replace(/{{fullName}}/g, `${user.firstName || ''} ${user.lastName || ''}`.trim())
      .replace(/{{email}}/g, user.email || '');
  }

  // Schedule follow-up email
  private async scheduleFollowUpEmail(user: any, userType: 'artist' | 'gallery' | 'collector', days: number) {
    try {
      const sendDate = new Date();
      sendDate.setDate(sendDate.getDate() + days);

      const followUpContent = this.getFollowUpContent(userType, days);
      
      await this.queueEmail({
        recipientEmail: user.email,
        recipientUserId: user.id,
        subject: followUpContent.subject,
        bodyHtml: this.personalizeEmailContent(followUpContent.content, user),
        priority: 5, // Medium priority for follow-ups
      });

      console.log(`Follow-up email scheduled for ${userType} in ${days} days: ${user.email}`);
    } catch (error) {
      console.error('Error scheduling follow-up email:', error);
    }
  }

  // Get follow-up content based on user type and days
  private getFollowUpContent(userType: 'artist' | 'gallery' | 'collector', days: number) {
    const followUpTemplates = {
      artist: {
        3: {
          subject: "Quick Start Guide - Optimize Your Art Profile",
          content: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #7c3aed;">Hi {{firstName}}! Let's optimize your artist profile</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                It's been a few days since you joined Art Souk. Here are some quick tips to boost your visibility:
              </p>
              <ul style="color: #4b5563; font-size: 16px; line-height: 1.8;">
                <li>📸 High-quality photos get 3x more views</li>
                <li>📝 Complete artist bio increases inquiries by 250%</li>
                <li>💰 Competitive pricing attracts more collectors</li>
                <li>📱 Social media integration expands your reach</li>
              </ul>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.PLATFORM_URL || 'https://artsouk.com'}/artworks/manage" 
                   style="background: linear-gradient(135deg, #7c3aed 0%, #d97706 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          font-weight: bold; 
                          font-size: 16px; 
                          display: inline-block;">
                  Complete your profile →
                </a>
              </div>
            </div>
          `
        },
        7: {
          subject: "Success Story: How Artists Thrive on Art Souk",
          content: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #7c3aed;">Inspiration from the Art Souk Community</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Many artists on our platform have found success by focusing on these key areas:
              </p>
              <ol style="color: #4b5563; font-size: 16px; line-height: 1.8;">
                <li>Professional photography of their pieces</li>
                <li>Engaging artist story in their bio</li>
                <li>Active engagement with collector inquiries</li>
                <li>Regular posting of new work</li>
              </ol>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Ready to take your art to the next level?
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.PLATFORM_URL || 'https://artsouk.com'}/dashboard" 
                   style="background: linear-gradient(135deg, #7c3aed 0%, #d97706 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          font-weight: bold; 
                          font-size: 16px; 
                          display: inline-block;">
                  View your dashboard →
                </a>
              </div>
            </div>
          `
        }
      },
      gallery: {
        3: {
          subject: "Gallery Success Tips - Maximize Your Digital Presence",
          content: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #7c3aed;">Take your gallery to the next level</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Successful galleries on our platform typically:
              </p>
              <ul style="color: #4b5563; font-size: 16px; line-height: 1.8;">
                <li>🎨 Feature 15+ artists in their roster</li>
                <li>📅 Host monthly virtual exhibitions</li>
                <li>📱 Maintain active social media presence</li>
                <li>🤝 Engage with the collector community</li>
              </ul>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.PLATFORM_URL || 'https://artsouk.com'}/manage/artists" 
                   style="background: linear-gradient(135deg, #7c3aed 0%, #d97706 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          font-weight: bold; 
                          font-size: 16px; 
                          display: inline-block;">
                  Invite your artists →
                </a>
              </div>
            </div>
          `
        }
      },
      collector: {
        3: {
          subject: "Discover Your First Piece - Curated Recommendations",
          content: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #7c3aed;">Artworks selected just for you</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Based on your interests, our curators have selected artworks that match your preferences for contemporary GCC art.
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Explore emerging artists and established names in the region's vibrant art scene.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.PLATFORM_URL || 'https://artsouk.com'}/artworks/featured" 
                   style="background: linear-gradient(135deg, #7c3aed 0%, #d97706 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          font-weight: bold; 
                          font-size: 16px; 
                          display: inline-block;">
                  View recommendations →
                </a>
              </div>
            </div>
          `
        }
      }
    };

    return followUpTemplates[userType]?.[days as keyof typeof followUpTemplates[typeof userType]] || {
      subject: "Continue Your Art Journey",
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Thank you for being part of the Art Souk community!
          </p>
        </div>
      `
    };
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();