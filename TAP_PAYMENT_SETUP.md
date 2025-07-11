# Tap Payment Integration Setup Guide

## ⚠️ CURRENTLY DISABLED
This integration is temporarily disabled until the platform achieves sufficient traffic. All code remains intact for easy re-activation.

## Overview
This guide explains how to integrate Tap Payment as a payment method for artists and galleries in the Art Souk platform.

## What is Tap Payment?
Tap Payment is a MENA-focused payment gateway that provides comprehensive marketplace solutions for platforms with multiple sellers. It's specifically designed for the Middle East market and handles all compliance requirements.

## Key Features

### ✅ Perfect for Art Souk
- **Regional Focus**: Specialized for Saudi Arabia & GCC markets
- **Split Payments**: Automatic commission collection (5% platform fee)
- **Seller Onboarding**: Direct API integration for artists/galleries
- **KYC Handled**: Tap manages all verification and compliance
- **Payment Methods**: mada, KNET, Visa, Mastercard, Apple Pay, STC Pay

### ✅ Marketplace Benefits
- **Business Creation API**: Onboard artists/galleries directly
- **Automatic Settlements**: Daily payouts to seller bank accounts
- **Webhook Integration**: Real-time payment status updates
- **Commission Splitting**: Platform fee automatically deducted
- **Multi-Currency**: Support for SAR and other GCC currencies

## Implementation Details

### Backend Integration
1. **TapPaymentService** (`server/tapPaymentService.ts`)
   - Business creation and management
   - Payment processing with split payments
   - Webhook handling for status updates
   - Available payment methods for region

2. **API Endpoints** (`server/routes.ts`)
   - `POST /api/tap/create-business` - Onboard new seller
   - `GET /api/tap/business-status/:businessId` - Check KYC status
   - `POST /api/tap/create-payment` - Process artwork payments
   - `POST /api/tap-webhook` - Handle payment notifications
   - `GET /api/tap/payment-methods` - Get supported methods

### Frontend Integration
1. **TapPaymentSetup** (`client/src/pages/TapPaymentSetup.tsx`)
   - Bilingual form for seller onboarding
   - Business information collection
   - Bank account setup
   - KYC document handling

2. **Translations** (`client/src/locales/`)
   - Complete Arabic and English translations
   - Business setup interface
   - Payment method descriptions

## Environment Configuration

### Required Environment Variables
```bash
# Tap Payment Configuration
TAP_MARKETPLACE_KEY=your_tap_marketplace_key_here
TAP_PRODUCTION_URL=https://api.tap.company/v2
TAP_SANDBOX_URL=https://api.tap.company/sandbox/v2
```

### Getting Tap Payment Keys
1. **Contact Tap Team**: Reach out to confirm marketplace solution eligibility
2. **Get Test Account**: Set up sandbox environment for testing
3. **Obtain Marketplace Keys**: Receive special keys for business onboarding
4. **KYC Completion**: Complete platform-level KYC with Tap
5. **Go Live**: Switch to production environment

## Integration Process

### For Artists/Galleries
1. **Access Setup Page**: Navigate to `/tap-payment-setup`
2. **Fill Business Information**: 
   - Business name (English/Arabic)
   - Contact details and address
   - National ID or Commercial Register
   - Bank account information (IBAN required)
3. **Submit for KYC**: Tap handles verification process
4. **Receive Approval**: Email notification when account is approved
5. **Start Accepting Payments**: Payment method automatically added to profile

### For Buyers
1. **Select Artwork**: Choose artwork from approved seller
2. **Checkout Process**: Redirected to Tap Payment page
3. **Choose Payment Method**: Select from mada, Visa, Apple Pay, etc.
4. **Complete Payment**: Secure payment processing
5. **Automatic Split**: Platform commission and seller amount distributed

## Payment Flow

### Split Payment Example
- **Artwork Price**: 1,000 SAR
- **Platform Commission**: 50 SAR (5%)
- **Seller Receives**: 950 SAR
- **Settlement**: Daily payout to seller's bank account

### Supported Payment Methods
- **mada** - Saudi Arabia's national payment scheme
- **Visa** - International credit/debit cards
- **Mastercard** - International credit/debit cards
- **Apple Pay** - Mobile payments
- **STC Pay** - Saudi digital wallet
- **KNET** - Kuwait's national payment network

## Security & Compliance

### KYC Requirements
- **Individual Artists**: National ID, bank account verification
- **Galleries**: Commercial registration, business license
- **Bank Verification**: IBAN validation and account ownership
- **Address Verification**: Physical address confirmation

### Compliance Features
- **PCI DSS Compliant**: Secure payment processing
- **Saudi Central Bank Approved**: Regulatory compliance
- **Anti-Money Laundering**: AML checks and monitoring
- **Data Protection**: GDPR and local privacy law compliance

## Testing & Development

### Sandbox Environment
- Use `TAP_SANDBOX_URL` for testing
- Test cards available from Tap documentation
- Simulate various payment scenarios
- Test webhook integrations

### Production Deployment
- Switch to `TAP_PRODUCTION_URL`
- Use production marketplace keys
- Monitor webhook endpoints
- Set up proper error handling

## Support & Documentation

### Tap Payment Resources
- **Developer Portal**: https://developers.tap.company/
- **API Documentation**: https://tappayments.api-docs.io/2.0/api
- **Support**: Available through Tap Payment dashboard

### Art Souk Implementation
- **Environment Setup**: Use provided `.env.example`
- **Translation Updates**: Modify locale files as needed
- **Route Configuration**: Add to App.tsx router
- **Database Integration**: Payment methods stored in artist/gallery profiles

## Revenue Model

### Commission Structure
- **Standard Rate**: 5% platform commission
- **Automatic Collection**: Deducted from each transaction
- **Transparent Pricing**: Clearly displayed to sellers
- **Daily Settlements**: Remaining amount paid to sellers

### Benefits for Platform
- **Passive Income**: Commission on every sale
- **Reduced Complexity**: No payment processing burden
- **Regional Expertise**: Tap handles local compliance
- **Scalability**: Support for growing seller base

This integration provides Art Souk with a robust, compliant, and user-friendly payment solution specifically designed for the Middle East market.

## Re-enabling the Integration

When ready to activate Tap Payment:

1. **Backend**: Uncomment the routes in `server/routes.ts` (lines 2082-2224)
2. **Frontend**: Uncomment the route and import in `client/src/App.tsx`
3. **Environment**: Add your Tap Payment API keys
4. **Testing**: Verify all endpoints and user flows work correctly

The integration is designed to be easily activated without any code changes.