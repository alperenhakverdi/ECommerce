using ECommerce.Application.DTOs.Payment;
using ECommerce.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace ECommerce.Infrastructure.Services;

public class FakePaymentService : IPaymentService
{
    private readonly ILogger<FakePaymentService> _logger;
    private readonly Dictionary<string, PaymentResult> _paymentHistory = new();
    
    // Test card numbers for simulation
    private readonly Dictionary<string, (bool IsSuccess, string ErrorMessage)> _testCards = new()
    {
        { "4111111111111111", (true, "") }, // Visa - Success
        { "4000000000000002", (false, "Card declined") }, // Visa - Declined
        { "5555555555554444", (true, "") }, // MasterCard - Success
        { "5200000000000007", (false, "Insufficient funds") }, // MasterCard - Insufficient funds
        { "378282246310005", (true, "") }, // Amex - Success
        { "4000000000000069", (false, "Card expired") }, // Expired card
        { "4000000000000127", (false, "Invalid CVC") }, // Invalid CVC
    };

    public FakePaymentService(ILogger<FakePaymentService> logger)
    {
        _logger = logger;
    }

    public async Task<PaymentResult> ProcessPaymentAsync(PaymentRequest paymentRequest)
    {
        _logger.LogInformation("Processing fake payment for Order {OrderId}, Amount: {Amount} {Currency}", 
            paymentRequest.OrderId, paymentRequest.Amount, paymentRequest.Currency);

        // Simulate processing delay
        await Task.Delay(Random.Shared.Next(500, 2000));

        var transactionId = Guid.NewGuid().ToString();
        var paymentReference = $"PAY_{DateTime.UtcNow:yyyyMMddHHmmss}_{Random.Shared.Next(1000, 9999)}";

        // Validate payment method
        var validationResult = await ValidatePaymentMethodAsync(paymentRequest.PaymentMethod);
        if (!validationResult)
        {
            var failedResult = CreateFailedPaymentResult(transactionId, paymentReference, 
                paymentRequest.Amount, paymentRequest.Currency, "Invalid payment method", "INVALID_PAYMENT_METHOD");
            _paymentHistory[transactionId] = failedResult;
            return failedResult;
        }

        // Simulate different scenarios based on payment method
        var result = paymentRequest.PaymentMethod.Type switch
        {
            PaymentType.CreditCard => ProcessCreditCardPayment(paymentRequest, transactionId, paymentReference),
            PaymentType.DebitCard => ProcessDebitCardPayment(paymentRequest, transactionId, paymentReference),
            PaymentType.PayPal => ProcessPayPalPayment(paymentRequest, transactionId, paymentReference),
            PaymentType.BankTransfer => ProcessBankTransferPayment(paymentRequest, transactionId, paymentReference),
            _ => CreateFailedPaymentResult(transactionId, paymentReference, 
                paymentRequest.Amount, paymentRequest.Currency, "Unsupported payment method", "UNSUPPORTED_METHOD")
        };

        // Store payment history
        _paymentHistory[transactionId] = result;

        _logger.LogInformation("Payment processed - Transaction ID: {TransactionId}, Status: {Status}", 
            transactionId, result.Status);

        return result;
    }

    public async Task<PaymentResult> RefundPaymentAsync(string transactionId, decimal amount)
    {
        _logger.LogInformation("Processing refund for Transaction {TransactionId}, Amount: {Amount}", 
            transactionId, amount);

        await Task.Delay(Random.Shared.Next(300, 1000));

        if (!_paymentHistory.TryGetValue(transactionId, out var originalPayment))
        {
            return CreateFailedPaymentResult(Guid.NewGuid().ToString(), "", 
                amount, "USD", "Original transaction not found", "TRANSACTION_NOT_FOUND");
        }

        if (originalPayment.Status != PaymentStatus.Completed)
        {
            return CreateFailedPaymentResult(Guid.NewGuid().ToString(), "", 
                amount, originalPayment.Currency, "Cannot refund non-completed payment", "INVALID_STATUS");
        }

        if (amount > originalPayment.Amount)
        {
            return CreateFailedPaymentResult(Guid.NewGuid().ToString(), "", 
                amount, originalPayment.Currency, "Refund amount exceeds original payment", "AMOUNT_EXCEEDED");
        }

        // 90% success rate for refunds
        var isSuccess = Random.Shared.NextDouble() > 0.1;
        var refundTransactionId = Guid.NewGuid().ToString();
        var refundReference = $"REF_{DateTime.UtcNow:yyyyMMddHHmmss}_{Random.Shared.Next(1000, 9999)}";

        PaymentResult refundResult;
        if (isSuccess)
        {
            refundResult = new PaymentResult
            {
                IsSuccess = true,
                TransactionId = refundTransactionId,
                PaymentReference = refundReference,
                Status = amount == originalPayment.Amount ? PaymentStatus.Refunded : PaymentStatus.PartialRefund,
                Amount = amount,
                Currency = originalPayment.Currency,
                ProcessedAt = DateTime.UtcNow,
                ProviderResponse = new PaymentProviderResponse
                {
                    ProviderName = "FakePaymentProvider",
                    ProviderTransactionId = refundTransactionId,
                    ProviderReference = refundReference,
                    AdditionalData = new Dictionary<string, object>
                    {
                        { "original_transaction_id", transactionId },
                        { "refund_type", amount == originalPayment.Amount ? "full" : "partial" }
                    }
                }
            };
        }
        else
        {
            refundResult = CreateFailedPaymentResult(refundTransactionId, refundReference, 
                amount, originalPayment.Currency, "Refund processing failed", "REFUND_FAILED");
        }

        _paymentHistory[refundTransactionId] = refundResult;
        return refundResult;
    }

    public async Task<PaymentStatus> GetPaymentStatusAsync(string transactionId)
    {
        await Task.Delay(100); // Simulate API delay

        if (_paymentHistory.TryGetValue(transactionId, out var payment))
        {
            return payment.Status;
        }

        // For testing purposes, if transaction not found in history, assume it was successful
        // In production, this should query a persistent database
        _logger.LogInformation("Payment status requested for transaction {TransactionId} - assuming completed for testing", transactionId);
        return PaymentStatus.Completed;
    }

    public async Task<bool> ValidatePaymentMethodAsync(PaymentMethod paymentMethod)
    {
        await Task.Delay(100); // Simulate validation delay

        return paymentMethod.Type switch
        {
            PaymentType.CreditCard or PaymentType.DebitCard => ValidateCreditCard(paymentMethod.CreditCard),
            PaymentType.PayPal => ValidatePayPal(paymentMethod.PayPal),
            PaymentType.BankTransfer => ValidateBankTransfer(paymentMethod.BankTransfer),
            _ => false
        };
    }

    private PaymentResult ProcessCreditCardPayment(PaymentRequest request, string transactionId, string paymentReference)
    {
        var cardNumber = request.PaymentMethod.CreditCard?.CardNumber ?? "";
        
        // Check test card scenarios
        if (_testCards.TryGetValue(cardNumber, out var testResult))
        {
            if (testResult.IsSuccess)
            {
                return CreateSuccessfulPaymentResult(transactionId, paymentReference, 
                    request.Amount, request.Currency, "CreditCardProvider");
            }
            else
            {
                return CreateFailedPaymentResult(transactionId, paymentReference, 
                    request.Amount, request.Currency, testResult.ErrorMessage, "CARD_ERROR");
            }
        }

        // For other cards, 100% success rate for testing
        var isSuccess = true; // Random.Shared.NextDouble() > 0.15;
        if (isSuccess)
        {
            return CreateSuccessfulPaymentResult(transactionId, paymentReference, 
                request.Amount, request.Currency, "CreditCardProvider");
        }
        else
        {
            var errorMessages = new[] { "Transaction declined", "Insufficient funds", "Card expired", "Invalid card details" };
            var errorMessage = errorMessages[Random.Shared.Next(errorMessages.Length)];
            return CreateFailedPaymentResult(transactionId, paymentReference, 
                request.Amount, request.Currency, errorMessage, "CARD_DECLINED");
        }
    }

    private PaymentResult ProcessDebitCardPayment(PaymentRequest request, string transactionId, string paymentReference)
    {
        // Similar to credit card but 100% success rate for testing
        var isSuccess = true; // Random.Shared.NextDouble() > 0.2;
        if (isSuccess)
        {
            return CreateSuccessfulPaymentResult(transactionId, paymentReference, 
                request.Amount, request.Currency, "DebitCardProvider");
        }
        else
        {
            return CreateFailedPaymentResult(transactionId, paymentReference, 
                request.Amount, request.Currency, "Insufficient balance", "INSUFFICIENT_FUNDS");
        }
    }

    private PaymentResult ProcessPayPalPayment(PaymentRequest request, string transactionId, string paymentReference)
    {
        // PayPal has 100% success rate for testing
        var isSuccess = true; // Random.Shared.NextDouble() > 0.05;
        if (isSuccess)
        {
            return CreateSuccessfulPaymentResult(transactionId, paymentReference, 
                request.Amount, request.Currency, "PayPalProvider");
        }
        else
        {
            return CreateFailedPaymentResult(transactionId, paymentReference, 
                request.Amount, request.Currency, "PayPal account restricted", "ACCOUNT_RESTRICTED");
        }
    }

    private PaymentResult ProcessBankTransferPayment(PaymentRequest request, string transactionId, string paymentReference)
    {
        // Bank transfer always "succeeds" but with pending status initially
        return new PaymentResult
        {
            IsSuccess = true,
            TransactionId = transactionId,
            PaymentReference = paymentReference,
            Status = PaymentStatus.Pending,
            Amount = request.Amount,
            Currency = request.Currency,
            ProcessedAt = DateTime.UtcNow,
            ProviderResponse = new PaymentProviderResponse
            {
                ProviderName = "BankTransferProvider",
                ProviderTransactionId = transactionId,
                ProviderReference = paymentReference,
                AdditionalData = new Dictionary<string, object>
                {
                    { "expected_completion", DateTime.UtcNow.AddDays(1).ToString("yyyy-MM-dd") },
                    { "transfer_type", "ACH" }
                }
            }
        };
    }

    private bool ValidateCreditCard(CreditCardDetails? creditCard)
    {
        if (creditCard == null) return false;
        
        return !string.IsNullOrWhiteSpace(creditCard.CardNumber) &&
               !string.IsNullOrWhiteSpace(creditCard.CardHolderName) &&
               !string.IsNullOrWhiteSpace(creditCard.ExpiryMonth) &&
               !string.IsNullOrWhiteSpace(creditCard.ExpiryYear) &&
               !string.IsNullOrWhiteSpace(creditCard.CVV) &&
               creditCard.CardNumber.Length >= 13 &&
               creditCard.CVV.Length >= 3;
    }

    private bool ValidatePayPal(PayPalDetails? paypal)
    {
        if (paypal == null) return false;
        return !string.IsNullOrWhiteSpace(paypal.Email) && paypal.Email.Contains('@');
    }

    private bool ValidateBankTransfer(BankTransferDetails? bankTransfer)
    {
        if (bankTransfer == null) return false;
        
        return !string.IsNullOrWhiteSpace(bankTransfer.BankName) &&
               !string.IsNullOrWhiteSpace(bankTransfer.AccountNumber) &&
               !string.IsNullOrWhiteSpace(bankTransfer.AccountHolderName);
    }

    private PaymentResult CreateSuccessfulPaymentResult(string transactionId, string paymentReference, 
        decimal amount, string currency, string providerName)
    {
        return new PaymentResult
        {
            IsSuccess = true,
            TransactionId = transactionId,
            PaymentReference = paymentReference,
            Status = PaymentStatus.Completed,
            Amount = amount,
            Currency = currency,
            ProcessedAt = DateTime.UtcNow,
            ProviderResponse = new PaymentProviderResponse
            {
                ProviderName = providerName,
                ProviderTransactionId = transactionId,
                ProviderReference = paymentReference,
                AdditionalData = new Dictionary<string, object>
                {
                    { "processing_time_ms", Random.Shared.Next(500, 2000) },
                    { "fraud_score", Random.Shared.NextDouble() * 100 }
                }
            }
        };
    }

    private PaymentResult CreateFailedPaymentResult(string transactionId, string paymentReference, 
        decimal amount, string currency, string errorMessage, string errorCode)
    {
        return new PaymentResult
        {
            IsSuccess = false,
            TransactionId = transactionId,
            PaymentReference = paymentReference,
            Status = PaymentStatus.Failed,
            Amount = amount,
            Currency = currency,
            ProcessedAt = DateTime.UtcNow,
            ErrorMessage = errorMessage,
            ErrorCode = errorCode,
            ProviderResponse = new PaymentProviderResponse
            {
                ProviderName = "FakePaymentProvider",
                ProviderTransactionId = transactionId,
                ProviderReference = paymentReference,
                AdditionalData = new Dictionary<string, object>
                {
                    { "error_details", errorMessage },
                    { "retry_after_seconds", Random.Shared.Next(30, 300) }
                }
            }
        };
    }
}