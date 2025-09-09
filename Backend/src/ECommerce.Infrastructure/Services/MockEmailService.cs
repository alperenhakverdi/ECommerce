using ECommerce.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ECommerce.Infrastructure.Services;

/// <summary>
/// Mock email service for development/testing
/// In production, replace with actual email service implementation
/// </summary>
public class MockEmailService : IEmailService
{
    private readonly ILogger<MockEmailService> _logger;
    private readonly IConfiguration _configuration;
    private readonly string? _frontendUrl;

    public MockEmailService(ILogger<MockEmailService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
        _frontendUrl = _configuration["Frontend:Url"] ?? "http://localhost:3000";
    }

    public async Task<bool> SendPasswordResetEmailAsync(string email, string resetToken, string userName)
    {
        try
        {
            // In production, you would send actual email using services like:
            // - SendGrid
            // - AWS SES
            // - SMTP server
            // - Azure Communication Services

            var resetUrl = $"{_frontendUrl}/reset-password?token={resetToken}&email={Uri.EscapeDataString(email)}";
            
            var emailContent = GeneratePasswordResetEmail(userName, resetUrl, resetToken);
            
            _logger.LogInformation("=== PASSWORD RESET EMAIL ===");
            _logger.LogInformation("To: {Email}", email);
            _logger.LogInformation("Subject: Reset Your Password");
            _logger.LogInformation("Content:\n{Content}", emailContent);
            _logger.LogInformation("Reset URL: {ResetUrl}", resetUrl);
            _logger.LogInformation("Token: {Token}", resetToken);
            _logger.LogInformation("==============================");

            // Simulate email sending delay
            await Task.Delay(100);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send password reset email to {Email}", email);
            return false;
        }
    }

    public async Task<bool> SendOrderConfirmationEmailAsync(string email, string orderId, object orderDetails)
    {
        try
        {
            _logger.LogInformation("=== ORDER CONFIRMATION EMAIL ===");
            _logger.LogInformation("To: {Email}", email);
            _logger.LogInformation("Subject: Order Confirmation - {OrderId}", orderId);
            _logger.LogInformation("Order Details: {OrderDetails}", orderDetails);
            _logger.LogInformation("================================");

            await Task.Delay(100);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send order confirmation email to {Email}", email);
            return false;
        }
    }

    public async Task<bool> SendEmailVerificationAsync(string email, string verificationToken, string userName)
    {
        try
        {
            var verificationUrl = $"{_frontendUrl}/verify-email?token={verificationToken}&email={Uri.EscapeDataString(email)}";
            
            _logger.LogInformation("=== EMAIL VERIFICATION ===");
            _logger.LogInformation("To: {Email}", email);
            _logger.LogInformation("Subject: Verify Your Email Address");
            _logger.LogInformation("User: {UserName}", userName);
            _logger.LogInformation("Verification URL: {VerificationUrl}", verificationUrl);
            _logger.LogInformation("Token: {Token}", verificationToken);
            _logger.LogInformation("=========================");

            await Task.Delay(100);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email verification to {Email}", email);
            return false;
        }
    }

    public async Task<bool> SendEmailAsync(string to, string subject, string body, bool isHtml = true)
    {
        try
        {
            _logger.LogInformation("=== GENERIC EMAIL ===");
            _logger.LogInformation("To: {Email}", to);
            _logger.LogInformation("Subject: {Subject}", subject);
            _logger.LogInformation("HTML: {IsHtml}", isHtml);
            _logger.LogInformation("Body:\n{Body}", body);
            _logger.LogInformation("====================");

            await Task.Delay(100);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", to);
            return false;
        }
    }

    public async Task<bool> SendStoreApprovalEmailAsync(string email, string storeName, string ownerName)
    {
        try
        {
            var dashboardUrl = $"{_frontendUrl}/store/dashboard";
            
            _logger.LogInformation("=== STORE APPROVAL EMAIL ===");
            _logger.LogInformation("To: {Email} ({OwnerName})", email, ownerName);
            _logger.LogInformation("Subject: 🎉 Tebrikler! {StoreName} Mağazanız Onaylandı", storeName);
            _logger.LogInformation("Store Name: {StoreName}", storeName);
            _logger.LogInformation("Dashboard URL: {DashboardUrl}", dashboardUrl);
            _logger.LogInformation("============================");

            await Task.Delay(100);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send store approval email to {Email}", email);
            return false;
        }
    }

    public async Task<bool> SendStoreRejectionEmailAsync(string email, string storeName, string ownerName, string rejectionReason)
    {
        try
        {
            _logger.LogInformation("=== STORE REJECTION EMAIL ===");
            _logger.LogInformation("To: {Email} ({OwnerName})", email, ownerName);
            _logger.LogInformation("Subject: Mağaza Başvurunuz Hakkında - {StoreName}", storeName);
            _logger.LogInformation("Store Name: {StoreName}", storeName);
            _logger.LogInformation("Rejection Reason: {RejectionReason}", rejectionReason);
            _logger.LogInformation("=============================");

            await Task.Delay(100);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send store rejection email to {Email}", email);
            return false;
        }
    }

    public async Task<bool> SendStoreSuspensionEmailAsync(string email, string storeName, string ownerName, string suspensionReason)
    {
        try
        {
            _logger.LogInformation("=== STORE SUSPENSION EMAIL ===");
            _logger.LogInformation("To: {Email} ({OwnerName})", email, ownerName);
            _logger.LogInformation("Subject: Önemli: {StoreName} Mağazanız Geçici Olarak Askıya Alındı", storeName);
            _logger.LogInformation("Store Name: {StoreName}", storeName);
            _logger.LogInformation("Suspension Reason: {SuspensionReason}", suspensionReason);
            _logger.LogInformation("==============================");

            await Task.Delay(100);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send store suspension email to {Email}", email);
            return false;
        }
    }

    /// <summary>
    /// Generate HTML content for password reset email
    /// </summary>
    private static string GeneratePasswordResetEmail(string userName, string resetUrl, string token)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Reset Your Password</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
        .container {{ background: #f4f4f4; padding: 20px; border-radius: 10px; }}
        .header {{ background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: white; padding: 30px; border-radius: 0 0 10px 10px; }}
        .button {{ display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .warning {{ background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Reset Your Password</h1>
        </div>
        <div class='content'>
            <p>Hello {userName},</p>
            
            <p>You have requested to reset your password for your ECommerce account. Click the button below to set a new password:</p>
            
            <div style='text-align: center;'>
                <a href='{resetUrl}' class='button'>Reset Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style='word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px;'>{resetUrl}</p>
            
            <div class='warning'>
                <strong>Security Notice:</strong>
                <ul>
                    <li>This link will expire in 24 hours</li>
                    <li>If you didn't request this reset, please ignore this email</li>
                    <li>Never share this link with anyone</li>
                </ul>
            </div>
            
            <p>If you're having trouble clicking the button, copy and paste the URL above into your web browser.</p>
            
            <p>Best regards,<br>The ECommerce Team</p>
        </div>
        <div class='footer'>
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>Token: {token}</p>
        </div>
    </div>
</body>
</html>";
    }
}