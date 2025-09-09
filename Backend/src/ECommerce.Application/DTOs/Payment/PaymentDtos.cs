namespace ECommerce.Application.DTOs.Payment;

public class PaymentRequest
{
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public PaymentMethod PaymentMethod { get; set; } = new();
    public string OrderId { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public BillingAddress? BillingAddress { get; set; }
}

public class PaymentMethod
{
    public PaymentType Type { get; set; } = PaymentType.CreditCard;
    public CreditCardDetails? CreditCard { get; set; }
    public PayPalDetails? PayPal { get; set; }
    public BankTransferDetails? BankTransfer { get; set; }
}

public class CreditCardDetails
{
    public string CardNumber { get; set; } = string.Empty;
    public string CardHolderName { get; set; } = string.Empty;
    public string ExpiryMonth { get; set; } = string.Empty;
    public string ExpiryYear { get; set; } = string.Empty;
    public string CVV { get; set; } = string.Empty;
    public string CardType { get; set; } = string.Empty; // Visa, MasterCard, etc.
}

public class PayPalDetails
{
    public string Email { get; set; } = string.Empty;
    public string PayerId { get; set; } = string.Empty;
}

public class BankTransferDetails
{
    public string BankName { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string RoutingNumber { get; set; } = string.Empty;
    public string AccountHolderName { get; set; } = string.Empty;
}

public class BillingAddress
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string AddressLine1 { get; set; } = string.Empty;
    public string AddressLine2 { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
}

public class PaymentResult
{
    public bool IsSuccess { get; set; }
    public string TransactionId { get; set; } = string.Empty;
    public string PaymentReference { get; set; } = string.Empty;
    public PaymentStatus Status { get; set; } = PaymentStatus.Failed;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
    public string? ErrorMessage { get; set; }
    public string? ErrorCode { get; set; }
    public PaymentProviderResponse? ProviderResponse { get; set; }
}

public class PaymentProviderResponse
{
    public string ProviderName { get; set; } = string.Empty;
    public string ProviderTransactionId { get; set; } = string.Empty;
    public string ProviderReference { get; set; } = string.Empty;
    public Dictionary<string, object> AdditionalData { get; set; } = new();
}

public enum PaymentType
{
    CreditCard = 1,
    DebitCard = 2,
    PayPal = 3,
    BankTransfer = 4,
    Cryptocurrency = 5,
    ApplePay = 6,
    GooglePay = 7
}

public enum PaymentStatus
{
    Pending = 1,
    Processing = 2,
    Completed = 3,
    Failed = 4,
    Cancelled = 5,
    Refunded = 6,
    PartialRefund = 7,
    Disputed = 8
}