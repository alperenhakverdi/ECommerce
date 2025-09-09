using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ECommerce.Application.Interfaces;
using ECommerce.Application.DTOs.Payment;
using ECommerce.Application.Validators;
using FluentValidation;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly IValidator<PaymentRequest> _paymentRequestValidator;
    private readonly ILogger<PaymentController> _logger;

    public PaymentController(
        IPaymentService paymentService,
        IValidator<PaymentRequest> paymentRequestValidator,
        ILogger<PaymentController> logger)
    {
        _paymentService = paymentService;
        _paymentRequestValidator = paymentRequestValidator;
        _logger = logger;
    }

    [HttpPost("process")]
    public async Task<ActionResult<PaymentResult>> ProcessPayment([FromBody] PaymentRequest paymentRequest)
    {
        try
        {
            var validationResult = await _paymentRequestValidator.ValidateAsync(paymentRequest);
            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.Errors.Select(e => e.ErrorMessage));
            }

            var result = await _paymentService.ProcessPaymentAsync(paymentRequest);
            
            if (result.IsSuccess)
            {
                _logger.LogInformation("Payment processed successfully. Transaction ID: {TransactionId}", 
                    result.TransactionId);
                return Ok(result);
            }
            else
            {
                _logger.LogWarning("Payment failed. Error: {ErrorMessage}, Code: {ErrorCode}", 
                    result.ErrorMessage, result.ErrorCode);
                return BadRequest(result);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing payment for order {OrderId}", paymentRequest.OrderId);
            return StatusCode(500, new { message = "An error occurred while processing the payment" });
        }
    }

    [HttpPost("{transactionId}/refund")]
    public async Task<ActionResult<PaymentResult>> RefundPayment(string transactionId, [FromBody] RefundRequest refundRequest)
    {
        try
        {
            if (refundRequest.Amount <= 0)
            {
                return BadRequest("Refund amount must be greater than 0");
            }

            var result = await _paymentService.RefundPaymentAsync(transactionId, refundRequest.Amount);
            
            if (result.IsSuccess)
            {
                _logger.LogInformation("Refund processed successfully. Transaction ID: {TransactionId}, Refund ID: {RefundId}", 
                    transactionId, result.TransactionId);
                return Ok(result);
            }
            else
            {
                _logger.LogWarning("Refund failed for transaction {TransactionId}. Error: {ErrorMessage}", 
                    transactionId, result.ErrorMessage);
                return BadRequest(result);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing refund for transaction {TransactionId}", transactionId);
            return StatusCode(500, new { message = "An error occurred while processing the refund" });
        }
    }

    [HttpGet("{transactionId}/status")]
    public async Task<ActionResult<PaymentStatus>> GetPaymentStatus(string transactionId)
    {
        try
        {
            var status = await _paymentService.GetPaymentStatusAsync(transactionId);
            return Ok(new { transactionId, status });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting payment status for transaction {TransactionId}", transactionId);
            return StatusCode(500, new { message = "An error occurred while getting payment status" });
        }
    }

    [HttpPost("validate-method")]
    public async Task<ActionResult<bool>> ValidatePaymentMethod([FromBody] PaymentMethod paymentMethod)
    {
        try
        {
            var isValid = await _paymentService.ValidatePaymentMethodAsync(paymentMethod);
            return Ok(new { isValid });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating payment method");
            return StatusCode(500, new { message = "An error occurred while validating payment method" });
        }
    }
}

public class RefundRequest
{
    public decimal Amount { get; set; }
    public string? Reason { get; set; }
}