import { InvoiceData, QuotationData, PaymentRecord, UserPreferences } from '../types';

export const PRESET_LOGOS = [
  {
    id: 'nordic',
    name: 'Nordic Studio',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-current"><polygon points="50,15 90,85 10,85" stroke="currentColor" stroke-width="8" fill="none"/><circle cx="50" cy="62" r="12" fill="currentColor"/></svg>`,
  },
  {
    id: 'apex',
    name: 'Apex Modern',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-current"><rect x="18" y="18" width="64" height="64" rx="16" stroke="currentColor" stroke-width="8"/><path d="M35 65L50 35L65 65" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: 'crown',
    name: 'Luxury Monogram',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-current"><path d="M20 75L20 40L38 58L50 25L62 58L80 40L80 75Z" fill="currentColor"/></svg>`,
  },
  {
    id: 'finance',
    name: 'Capital Group',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-current"><rect x="15" y="45" width="16" height="40" rx="4" fill="currentColor"/><rect x="42" y="30" width="16" height="55" rx="4" fill="currentColor"/><rect x="69" y="15" width="16" height="70" rx="4" fill="currentColor"/></svg>`,
  },
  {
    id: 'sphere',
    name: 'Global Tech',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-current"><circle cx="50" cy="50" r="35" stroke="currentColor" stroke-width="8"/><ellipse cx="50" cy="50" rx="35" ry="14" stroke="currentColor" stroke-width="6"/><line x1="15" y1="50" x2="85" y2="50" stroke="currentColor" stroke-width="6"/></svg>`,
  },
];

export const INITIAL_USER_PREFERENCES: UserPreferences = {
  defaultInvoiceTemplate: 'classic-business',
  defaultReceiptTemplate: 'receipt-stripe',
  defaultQuotationTemplate: 'quote-classic',
  defaultInvoiceEmailTemplate: 'email-invoice-sent',
  defaultPaymentEmailTemplate: 'email-payment-success',
  defaultReminderEmailTemplate: 'email-payment-reminder',
  favorites: ['classic-business', 'luxury-black-gold', 'stripe-receipt', 'receipt-stripe', 'quote-classic'],
  recentlyUsed: ['classic-business', 'modern-minimal', 'luxury-black-gold'],
};

export const INITIAL_INVOICE: InvoiceData = {
  id: 'inv_10928374',
  invoiceNumber: 'INV-2026-0842',
  issueDate: '2026-10-18',
  dueDate: '2026-11-17',
  status: 'pending',
  business: {
    name: 'Vanguard Dynamics Inc.',
    legalName: 'Vanguard Dynamics Global Corporation',
    email: 'billing@vanguarddynamics.io',
    phone: '+1 (555) 382-9100',
    website: 'https://vanguarddynamics.io',
    address: '742 Montgomery St, Suite 1400',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94111',
    country: 'United States',
    taxId: 'US-EIN-94-3829104',
    registrationNumber: 'DE-CORP-728190',
  },
  client: {
    name: 'Eleanor Vance',
    company: 'Starlight Media Group LLC',
    email: 'e.vance@starlightmedia.com',
    phone: '+1 (415) 890-4421',
    address: '100 Pier Avenue, Floor 4',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'United States',
    taxId: 'US-VAT-CA-99201',
    poNumber: 'PO-2026-9041',
  },
  items: [
    {
      id: 'item_1',
      description: 'Brand Identity Architecture & Design System (Phase 1)',
      quantity: 1,
      rate: 4500,
      sku: 'SRV-BRAND-01',
      category: 'Design & Strategy',
    },
    {
      id: 'item_2',
      description: 'Custom React & Vite Web Application Engineering (80 hrs)',
      quantity: 80,
      rate: 145,
      sku: 'DEV-FE-ENG',
      category: 'Engineering',
    },
    {
      id: 'item_3',
      description: 'High-Performance Cloud Infrastructure & CDN Configuration',
      quantity: 1,
      rate: 1850,
      sku: 'DEV-DEVOPS-02',
      category: 'Infrastructure',
    },
    {
      id: 'item_4',
      description: 'Dedicated Accessibility & Multi-Device QA Testing',
      quantity: 12,
      rate: 125,
      sku: 'QA-AUDIT-WCAG',
      category: 'Quality Assurance',
    },
  ],
  discountType: 'percentage',
  discountValue: 5,
  shipping: 0,
  taxPercent: 8.5,
  notes: 'Thank you for partnering with Vanguard Dynamics. All intellectual property rights transfer upon final invoice payment clearance.',
  terms: 'Payment is due within 30 days of issue date. Late balances are subject to a statutory 1.5% monthly financing charge. Direct bank transfer is preferred.',
  paymentDetails: {
    bankName: 'Silicon Valley Commercial Bank',
    accountName: 'Vanguard Dynamics Operating Trust',
    accountNumber: '4820 9182 3019',
    routingOrSort: '121000358',
    iban: 'US89 SVBK 1210 0035 8482 0918 23',
    swift: 'SVBKUS6S',
    paypalEmail: 'payments@vanguarddynamics.io',
    stripePaymentUrl: 'https://pay.vanguarddynamics.io/inv-0842',
    qrCodeNote: 'Scan with banking app for instant zero-fee wire settlement',
  },
  templateId: 'classic-business',
  customization: {
    primaryColor: '#1e293b',
    accentColor: '#4f46e5',
    fontFamily: 'font-jakarta',
    fontSize: 'normal',
    tableStyle: 'striped',
    headerStyle: 'standard',
    showTaxColumn: true,
    showSkuColumn: true,
    currency: 'USD',
    currencySymbol: '$',
    dateFormat: 'MMM DD, YYYY',
    footerNotes: 'Questions about this invoice? Email billing@vanguarddynamics.io or call +1 (555) 382-9100.',
    terms: 'Net 30 days. Late fees apply after November 17, 2026.',
    logoSize: 52,
    logoPosition: 'left',
  },
  paidAmount: 0,
};

export const INITIAL_QUOTATION: QuotationData = {
  id: 'quot_991823',
  quotationNumber: 'QT-2026-0319',
  issueDate: '2026-10-25',
  validUntil: '2026-11-25',
  status: 'sent',
  business: {
    name: 'Vanguard Dynamics Inc.',
    legalName: 'Vanguard Dynamics Global Corporation',
    email: 'proposals@vanguarddynamics.io',
    phone: '+1 (555) 382-9100',
    website: 'https://vanguarddynamics.io',
    address: '742 Montgomery St, Suite 1400',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94111',
    country: 'United States',
    taxId: 'US-EIN-94-3829104',
  },
  client: {
    name: 'Marcus Sterling',
    company: 'Nexus Ventures Europe Ltd',
    email: 'm.sterling@nexusventures.eu',
    phone: '+44 20 7946 0912',
    address: '30 St Mary Axe, 18th Floor',
    city: 'London',
    state: 'England',
    postalCode: 'EC3A 8EP',
    country: 'United Kingdom',
    taxId: 'GB-992-1082-41',
  },
  items: [
    {
      id: 'qitem_1',
      description: 'Omnichannel B2B Customer Portal Discovery & Strategy',
      quantity: 1,
      rate: 6800,
      sku: 'STRAT-PORTAL-01',
    },
    {
      id: 'qitem_2',
      description: 'Interactive Prototyping & Figma Design System Library',
      quantity: 1,
      rate: 8500,
      sku: 'DS-FIGMA-CORE',
    },
    {
      id: 'qitem_3',
      description: 'Full-Stack Portal Development with Real-Time Data Sync',
      quantity: 1,
      rate: 18500,
      sku: 'ENG-PORTAL-V1',
    },
    {
      id: 'qitem_4',
      description: 'Enterprise SSO, SOC2 Security Auditing & Deployment',
      quantity: 1,
      rate: 4200,
      sku: 'SEC-SOC2-DEPLOY',
    },
  ],
  projectScopeOverview: 'Full turnkey design and implementation of Nexus Ventures real-time investor analytics and portfolio capital management portal with single sign-on and high-frequency data pipeline integration.',
  deliverables: [
    'Complete Figma Design Tokens and Interactive Prototype',
    'Production React SPA & Node Microservice API',
    'SOC2 Type II Security Compliance Checklist & Penetration Test Report',
    'Full Technical Documentation & Staff Knowledge Transfer Sessions',
  ],
  discountType: 'percentage',
  discountValue: 0,
  taxPercent: 0, // Cross-border reverse charge
  notes: 'Proposal rates guaranteed for 30 calendar days from date of transmission. Work will commence within 5 business days of contract execution and deposit receipt.',
  terms: '50% deposit due on acceptance, 25% on mid-term milestone demo, 25% upon final deployment.',
  templateId: 'quote-classic',
  customization: {
    primaryColor: '#1e293b',
    accentColor: '#7c3aed',
    fontFamily: 'font-jakarta',
    fontSize: 'normal',
    tableStyle: 'striped',
    headerStyle: 'standard',
    showTaxColumn: false,
    showSkuColumn: true,
    currency: 'USD',
    currencySymbol: '$',
    dateFormat: 'MMM DD, YYYY',
    footerNotes: 'Authorized Signatory: Vanguard Dynamics Executive Committee',
    terms: 'Valid until November 25, 2026.',
    logoSize: 52,
    logoPosition: 'left',
  },
};

export const INITIAL_PAYMENT_RECORDS: PaymentRecord[] = [
  {
    id: 'pay_rec_01',
    invoiceId: 'inv_10928374',
    receiptNumber: 'RCP-2026-0842-1',
    amountPaid: 10000,
    totalInvoiceAmount: 18742.75,
    remainingBalance: 8742.75,
    paymentDate: '2026-10-22',
    paymentMethod: 'Bank Transfer / ACH',
    transactionReference: 'ACH-REF-90281-SVBK',
    notes: 'Initial milestone deposit processed via Fedwire ACH clearing.',
    templateId: 'receipt-stripe',
  },
];

export function calculateTotals(items: { rate: number; quantity: number }[], discountType: 'percentage' | 'fixed', discountValue: number, taxPercent: number, shipping: number = 0) {
  const subtotal = items.reduce((sum, item) => sum + (item.rate * item.quantity), 0);
  
  const discountAmount = discountType === 'percentage' 
    ? (subtotal * (discountValue / 100))
    : Math.min(discountValue, subtotal);

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableAmount * (taxPercent / 100));
  const total = taxableAmount + taxAmount + shipping;

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    total,
  };
}

export function formatCurrency(amount: number, symbol: string = '$', currencyCode: string = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
