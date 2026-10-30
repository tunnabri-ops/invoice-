export type DocumentType = 'invoice' | 'receipt' | 'quotation' | 'email';

export type TemplateCategory =
  | 'all'
  | 'minimal'
  | 'business'
  | 'corporate'
  | 'creative'
  | 'luxury'
  | 'freelancer'
  | 'ecommerce'
  | 'dark'
  | 'modern';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  taxRate?: number; // e.g. 10 for 10%
  sku?: string;
  category?: string;
}

export interface BusinessDetails {
  name: string;
  legalName?: string;
  logoUrl?: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  taxId: string; // e.g. VAT / GST / EIN
  registrationNumber?: string;
}

export interface ClientDetails {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  taxId?: string;
  poNumber?: string;
}

export interface PaymentDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingOrSort: string;
  iban?: string;
  swift?: string;
  paypalEmail?: string;
  stripePaymentUrl?: string;
  qrCodeNote?: string;
}

export interface CustomizationSettings {
  primaryColor: string;
  accentColor: string;
  fontFamily: 'font-jakarta' | 'font-manrope' | 'font-playfair' | 'font-outfit' | 'font-fraunces' | 'font-space' | 'font-mono-code' | 'font-dmsans';
  fontSize: 'compact' | 'normal' | 'spacious';
  tableStyle: 'striped' | 'bordered' | 'minimal' | 'cards' | 'underlined';
  headerStyle: 'standard' | 'split' | 'centered' | 'banner' | 'dark' | 'minimal';
  showTaxColumn: boolean;
  showSkuColumn: boolean;
  currency: string;
  currencySymbol: string;
  dateFormat: string;
  footerNotes: string;
  terms: string;
  logoSize: number; // in px e.g. 48
  logoPosition: 'left' | 'center' | 'right';
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'partially_paid';
  business: BusinessDetails;
  client: ClientDetails;
  items: LineItem[];
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  shipping: number;
  taxPercent: number;
  notes: string;
  terms: string;
  paymentDetails: PaymentDetails;
  templateId: string;
  customization: CustomizationSettings;
  paidAmount?: number;
  paidDate?: string;
  paymentReference?: string;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  receiptNumber: string;
  amountPaid: number;
  totalInvoiceAmount: number;
  remainingBalance: number;
  paymentDate: string;
  paymentMethod: 'Credit Card' | 'Bank Transfer / ACH' | 'PayPal' | 'Stripe' | 'Wire Transfer' | 'Cash';
  transactionReference: string;
  notes?: string;
  templateId: string;
}

export interface QuotationData {
  id: string;
  quotationNumber: string;
  issueDate: string;
  validUntil: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired' | 'converted';
  convertedInvoiceId?: string;
  business: BusinessDetails;
  client: ClientDetails;
  items: LineItem[];
  projectScopeOverview: string;
  deliverables?: string[];
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  taxPercent: number;
  notes: string;
  terms: string;
  templateId: string;
  customization: CustomizationSettings;
}

export interface EmailTemplateData {
  id: string;
  name: string;
  category: 'invoice' | 'payment' | 'quotation' | 'account';
  subject: string;
  previewText: string;
  headline: string;
  messageBody: string;
  callToActionText: string;
  callToActionUrl: string;
  secondaryActionText?: string;
  bannerColor?: string;
  accentColor?: string;
  layoutVariant: string;
  includePdfAttachment: boolean;
  footerNote: string;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  previewColor: string;
  badge?: string;
  recommendedFor?: string;
  font: string;
}

export interface UserPreferences {
  defaultInvoiceTemplate: string;
  defaultReceiptTemplate: string;
  defaultQuotationTemplate: string;
  defaultInvoiceEmailTemplate: string;
  defaultPaymentEmailTemplate: string;
  defaultReminderEmailTemplate: string;
  favorites: string[]; // list of template IDs
  recentlyUsed: string[]; // list of template IDs
}

export interface ApprovedDomain {
  domain: string;
  status: 'verified' | 'pending' | 'unverified';
  isApproved: boolean;
  region?: string;
  dnsRecordsCount?: number;
}

export interface SenderConfig {
  username: string;
  domain: string;
  displayName: string;
  email: string;
  updatedAt?: string;
  isConfigured?: boolean;
}

export interface EmailActivityRecord {
  id: string;
  resendId?: string;
  from: string;
  to: string;
  subject: string;
  invoiceNumber?: string;
  status: 'accepted' | 'sent' | 'failed';
  statusDetails: string;
  timestamp: string;
  hasAttachment: boolean;
  error?: string;
}
