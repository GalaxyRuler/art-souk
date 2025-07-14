import { db } from './db';
import { emailTemplates } from '@shared/schema';

const defaultTemplates = [
  {
    templateCode: 'welcome',
    name: 'Welcome Email',
    nameAr: 'بريد الترحيب',
    subject: 'Welcome to Art Souk - Your Gateway to GCC Art',
    subjectAr: 'مرحباً بك في سوق آرت - بوابتك لفن الخليج',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">Welcome to Art Souk!</h1>
        <p>Dear {{firstName}},</p>
        <p>Thank you for joining Art Souk, the premier marketplace for contemporary art from Saudi Arabia and the GCC region.</p>
        <p>Here's what you can do on our platform:</p>
        <ul>
          <li>Discover amazing artworks from talented regional artists</li>
          <li>Connect with galleries and collectors</li>
          <li>Participate in live auctions</li>
          <li>Attend workshops and events</li>
        </ul>
        <p>Start exploring today and immerse yourself in the vibrant art scene of the Gulf!</p>
        <p>Best regards,<br>The Art Souk Team</p>
      </div>
    `,
    bodyHtmlAr: `
      <div style="font-family: 'Noto Sans Arabic', Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
        <h1 style="color: #1e40af;">مرحباً بك في سوق آرت!</h1>
        <p>عزيزي {{firstName}}،</p>
        <p>شكراً لانضمامك إلى سوق آرت، السوق الرائد للفن المعاصر من المملكة العربية السعودية ودول مجلس التعاون الخليجي.</p>
        <p>إليك ما يمكنك القيام به على منصتنا:</p>
        <ul>
          <li>اكتشف أعمالاً فنية مذهلة من فنانين موهوبين من المنطقة</li>
          <li>تواصل مع المعارض وهواة جمع الأعمال الفنية</li>
          <li>شارك في المزادات المباشرة</li>
          <li>احضر ورش العمل والفعاليات</li>
        </ul>
        <p>ابدأ الاستكشاف اليوم وانغمس في المشهد الفني النابض بالحياة في الخليج!</p>
        <p>مع أطيب التحيات،<br>فريق سوق آرت</p>
      </div>
    `,
    bodyText: `Welcome to Art Souk!

Dear {{firstName}},

Thank you for joining Art Souk, the premier marketplace for contemporary art from Saudi Arabia and the GCC region.

Here's what you can do on our platform:
- Discover amazing artworks from talented regional artists
- Connect with galleries and collectors
- Participate in live auctions
- Attend workshops and events

Start exploring today and immerse yourself in the vibrant art scene of the Gulf!

Best regards,
The Art Souk Team`,
    bodyTextAr: `مرحباً بك في سوق آرت!

عزيزي {{firstName}}،

شكراً لانضمامك إلى سوق آرت، السوق الرائد للفن المعاصر من المملكة العربية السعودية ودول مجلس التعاون الخليجي.

إليك ما يمكنك القيام به على منصتنا:
- اكتشف أعمالاً فنية مذهلة من فنانين موهوبين من المنطقة
- تواصل مع المعارض وهواة جمع الأعمال الفنية
- شارك في المزادات المباشرة
- احضر ورش العمل والفعاليات

ابدأ الاستكشاف اليوم وانغمس في المشهد الفني النابض بالحياة في الخليج!

مع أطيب التحيات،
فريق سوق آرت`,
    variables: ['firstName'],
  },
  {
    templateCode: 'order_confirmation',
    name: 'Order Confirmation',
    nameAr: 'تأكيد الطلب',
    subject: 'Order Confirmed - {{orderNumber}}',
    subjectAr: 'تأكيد الطلب - {{orderNumber}}',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">Order Confirmed!</h1>
        <p>Dear {{buyerName}},</p>
        <p>Your order has been confirmed by the seller.</p>
        <h3>Order Details:</h3>
        <ul>
          <li><strong>Order Number:</strong> {{orderNumber}}</li>
          <li><strong>Artwork:</strong> {{artworkTitle}}</li>
          <li><strong>Artist:</strong> {{artistName}}</li>
          <li><strong>Price:</strong> {{price}} SAR</li>
        </ul>
        <p>The seller will contact you directly regarding payment arrangements.</p>
        <p>Thank you for choosing Art Souk!</p>
      </div>
    `,
    bodyHtmlAr: `
      <div style="font-family: 'Noto Sans Arabic', Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
        <h1 style="color: #1e40af;">تم تأكيد الطلب!</h1>
        <p>عزيزي {{buyerName}}،</p>
        <p>تم تأكيد طلبك من قبل البائع.</p>
        <h3>تفاصيل الطلب:</h3>
        <ul>
          <li><strong>رقم الطلب:</strong> {{orderNumber}}</li>
          <li><strong>العمل الفني:</strong> {{artworkTitle}}</li>
          <li><strong>الفنان:</strong> {{artistName}}</li>
          <li><strong>السعر:</strong> {{price}} ر.س</li>
        </ul>
        <p>سيتواصل معك البائع مباشرة بخصوص ترتيبات الدفع.</p>
        <p>شكراً لاختيارك سوق آرت!</p>
      </div>
    `,
    variables: ['buyerName', 'orderNumber', 'artworkTitle', 'artistName', 'price'],
  },
  {
    templateCode: 'newsletter',
    name: 'Newsletter',
    nameAr: 'النشرة الإخبارية',
    subject: 'Art Souk Newsletter - {{month}} Edition',
    subjectAr: 'نشرة سوق آرت الإخبارية - إصدار {{month}}',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">Art Souk Newsletter</h1>
        <h2>{{month}} Edition</h2>
        {{content}}
        <hr>
        <p style="font-size: 12px; color: #666;">
          You're receiving this because you subscribed to Art Souk newsletter.
          <a href="{{unsubscribeUrl}}">Unsubscribe</a>
        </p>
      </div>
    `,
    bodyHtmlAr: `
      <div style="font-family: 'Noto Sans Arabic', Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
        <h1 style="color: #1e40af;">نشرة سوق آرت الإخبارية</h1>
        <h2>إصدار {{month}}</h2>
        {{content}}
        <hr>
        <p style="font-size: 12px; color: #666;">
          أنت تتلقى هذا لأنك مشترك في نشرة سوق آرت الإخبارية.
          <a href="{{unsubscribeUrl}}">إلغاء الاشتراك</a>
        </p>
      </div>
    `,
    variables: ['month', 'content', 'unsubscribeUrl'],
  },
];

export async function seedEmailTemplates() {
  try {
    console.log('Seeding email templates...');

    for (const template of defaultTemplates) {
      await db.insert(emailTemplates).values(template).onConflictDoNothing();
    }

    console.log('Email templates seeded successfully!');
  } catch (error) {
    console.error('Error seeding email templates:', error);
  }
}

// Run the seeding function
seedEmailTemplates()
  .then(() => {
    console.log('Done seeding email templates');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
