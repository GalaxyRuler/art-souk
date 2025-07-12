import { z } from 'zod';

// Tap Payment API configuration
const TAP_API_BASE = 'https://api.tap.company/v2';
const TAP_SANDBOX_BASE = 'https://api.tap.company/sandbox/v2';

// Tap Payment schemas
export const tapBusinessSchema = z.object({
  name: z.string(),
  nameAr: z.string().optional(),
  businessType: z.enum(['artist', 'gallery']),
  email: z.string().email(),
  phone: z.string(),
  country: z.string().default('SA'),
  city: z.string(),
  address: z.string(),
  nationalId: z.string().optional(),
  commercialRegister: z.string().optional(),
  bankAccount: z.object({
    accountNumber: z.string(),
    bankName: z.string(),
    iban: z.string(),
    swiftCode: z.string().optional(),
  }),
});

export const tapPaymentMethodSchema = z.object({
  type: z.literal('tap_payment'),
  destinationId: z.string(),
  businessId: z.string(),
  accountStatus: z.enum(['pending', 'approved', 'rejected']),
  commissionRate: z.number().min(0).max(100).default(5), // Platform commission %
  autoSplit: z.boolean().default(true),
});

export type TapBusiness = z.infer<typeof tapBusinessSchema>;
export type TapPaymentMethod = z.infer<typeof tapPaymentMethodSchema>;

export class TapPaymentService {
  private apiKey: string;
  private isProduction: boolean;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.TAP_MARKETPLACE_KEY || '';
    this.isProduction = process.env.NODE_ENV === 'production';
    this.baseUrl = this.isProduction ? TAP_API_BASE : TAP_SANDBOX_BASE;
    
    if (!this.apiKey) {
      throw new Error('TAP_MARKETPLACE_KEY environment variable is required');
    }
  }

  private async makeApiCall(endpoint: string, method: string = 'GET', data?: any) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(`Tap API Error: ${result.message || 'Unknown error'}`);
      }
      
      return result;
    } catch (error) {
      console.error('Tap Payment API call failed:', error);
      throw error;
    }
  }

  // Create a new business (artist/gallery) in Tap
  async createBusiness(businessData: TapBusiness) {
    const tapBusinessData = {
      name: businessData.name,
      name_ar: businessData.nameAr,
      business_type: businessData.businessType,
      email: businessData.email,
      phone: businessData.phone,
      country: businessData.country,
      city: businessData.city,
      address: businessData.address,
      national_id: businessData.nationalId,
      commercial_register: businessData.commercialRegister,
      bank_account: {
        account_number: businessData.bankAccount.accountNumber,
        bank_name: businessData.bankAccount.bankName,
        iban: businessData.bankAccount.iban,
        swift_code: businessData.bankAccount.swiftCode,
      },
    };

    return await this.makeApiCall('/business', 'POST', tapBusinessData);
  }

  // Get business status
  async getBusinessStatus(businessId: string) {
    return await this.makeApiCall(`/business/${businessId}`);
  }

  // Create destination ID for payments
  async createDestination(businessId: string) {
    return await this.makeApiCall('/destinations', 'POST', {
      business_id: businessId,
      amount: 0, // Will be set per transaction
      currency: 'SAR',
    });
  }

  // Create a payment with split (commission)
  async createPayment(paymentData: {
    amount: number;
    currency: string;
    sellerId: string;
    destinationId: string;
    commissionRate: number;
    orderId: string;
    description: string;
  }) {
    const commissionAmount = (paymentData.amount * paymentData.commissionRate) / 100;
    const sellerAmount = paymentData.amount - commissionAmount;

    const tapPaymentData = {
      amount: paymentData.amount,
      currency: paymentData.currency,
      threeDSecure: true,
      save_card: false,
      description: paymentData.description,
      reference: {
        order_id: paymentData.orderId,
      },
      receipt: {
        email: true,
        sms: false,
      },
      customer: {
        first_name: '',
        last_name: '',
        email: '',
        phone: {
          country_code: '966',
          number: '',
        },
      },
      merchant: {
        id: paymentData.sellerId,
      },
      source: {
        id: 'src_all', // Allow all payment methods
      },
      destinations: {
        destination: [
          {
            id: paymentData.destinationId,
            amount: sellerAmount,
            currency: paymentData.currency,
          },
        ],
      },
      post: {
        url: `${process.env.APP_URL}/api/tap-webhook`,
      },
    };

    return await this.makeApiCall('/charges', 'POST', tapPaymentData);
  }

  // Handle webhook notifications
  async handleWebhook(webhookData: any) {
    // Verify webhook signature (implement based on Tap documentation)
    const { id, status, amount, currency, reference } = webhookData;
    
    return {
      chargeId: id,
      status,
      amount,
      currency,
      orderId: reference?.order_id,
      success: status === 'CAPTURED',
    };
  }

  // Get payment methods available in Saudi Arabia
  getAvailablePaymentMethods() {
    return [
      { id: 'mada', name: 'mada', nameAr: 'مدى' },
      { id: 'visa', name: 'Visa', nameAr: 'فيزا' },
      { id: 'mastercard', name: 'Mastercard', nameAr: 'ماستركارد' },
      { id: 'apple_pay', name: 'Apple Pay', nameAr: 'آبل باي' },
      { id: 'stc_pay', name: 'STC Pay', nameAr: 'إس تي سي باي' },
      { id: 'knet', name: 'KNET', nameAr: 'كي نت' },
      { id: 'fawry', name: 'Fawry', nameAr: 'فوري' },
    ];
  }
}

export const tapPaymentService = new TapPaymentService();