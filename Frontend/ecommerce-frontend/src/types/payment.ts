export enum PaymentType {
  CreditCard = 1,
  DebitCard = 2,
  PayPal = 3,
  BankTransfer = 4,
  Cryptocurrency = 5,
  ApplePay = 6,
  GooglePay = 7
}

export enum PaymentStatus {
  Pending = 1,
  Processing = 2,
  Completed = 3,
  Failed = 4,
  Cancelled = 5,
  Refunded = 6,
  PartialRefund = 7,
  Disputed = 8
}

export interface CreditCardDetails {
  cardNumber: string;
  cardHolderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardType?: string;
}

export interface PayPalDetails {
  email: string;
  payerId: string;
}

export interface BankTransferDetails {
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountHolderName: string;
}

export interface BillingAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PaymentMethod {
  type: PaymentType;
  creditCard?: CreditCardDetails;
  payPal?: PayPalDetails;
  bankTransfer?: BankTransferDetails;
  savedCardId?: string;
  installments?: number;
  saveCard?: boolean;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  orderId: string;
  customerEmail: string;
  description?: string;
  billingAddress?: BillingAddress;
}

export interface PaymentProviderResponse {
  providerName: string;
  providerTransactionId: string;
  providerReference: string;
  additionalData: Record<string, any>;
}

export interface PaymentResult {
  isSuccess: boolean;
  transactionId: string;
  paymentReference: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  processedAt: string;
  errorMessage?: string;
  errorCode?: string;
  providerResponse?: PaymentProviderResponse;
}

export interface RefundRequest {
  amount: number;
  reason?: string;
}