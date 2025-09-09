using ECommerce.Application.DTOs.Payment;

namespace ECommerce.Application.Interfaces;

public interface IPaymentService
{
    Task<PaymentResult> ProcessPaymentAsync(PaymentRequest paymentRequest);
    Task<PaymentResult> RefundPaymentAsync(string transactionId, decimal amount);
    Task<PaymentStatus> GetPaymentStatusAsync(string transactionId);
    Task<bool> ValidatePaymentMethodAsync(PaymentMethod paymentMethod);
}