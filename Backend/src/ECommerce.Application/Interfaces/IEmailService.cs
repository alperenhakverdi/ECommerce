namespace ECommerce.Application.Interfaces;

/// <summary>
/// Service interface for sending emails
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Send password reset email
    /// </summary>
    /// <param name="email">Recipient email address</param>
    /// <param name="resetToken">Password reset token</param>
    /// <param name="userName">User's full name</param>
    /// <returns>True if email was sent successfully</returns>
    Task<bool> SendPasswordResetEmailAsync(string email, string resetToken, string userName);

    /// <summary>
    /// Send order confirmation email
    /// </summary>
    /// <param name="email">Recipient email address</param>
    /// <param name="orderId">Order ID</param>
    /// <param name="orderDetails">Order details</param>
    /// <returns>True if email was sent successfully</returns>
    Task<bool> SendOrderConfirmationEmailAsync(string email, string orderId, object orderDetails);

    /// <summary>
    /// Send email verification email
    /// </summary>
    /// <param name="email">Recipient email address</param>
    /// <param name="verificationToken">Email verification token</param>
    /// <param name="userName">User's full name</param>
    /// <returns>True if email was sent successfully</returns>
    Task<bool> SendEmailVerificationAsync(string email, string verificationToken, string userName);

    /// <summary>
    /// Send generic email
    /// </summary>
    /// <param name="to">Recipient email address</param>
    /// <param name="subject">Email subject</param>
    /// <param name="body">Email body (HTML or plain text)</param>
    /// <param name="isHtml">Whether the body is HTML</param>
    /// <returns>True if email was sent successfully</returns>
    Task<bool> SendEmailAsync(string to, string subject, string body, bool isHtml = true);

    /// <summary>
    /// Send store approval notification email
    /// </summary>
    /// <param name="email">Store owner's email address</param>
    /// <param name="storeName">Name of the store</param>
    /// <param name="ownerName">Store owner's full name</param>
    /// <returns>True if email was sent successfully</returns>
    Task<bool> SendStoreApprovalEmailAsync(string email, string storeName, string ownerName);

    /// <summary>
    /// Send store rejection notification email
    /// </summary>
    /// <param name="email">Store owner's email address</param>
    /// <param name="storeName">Name of the store</param>
    /// <param name="ownerName">Store owner's full name</param>
    /// <param name="rejectionReason">Structured rejection reason (JSON)</param>
    /// <returns>True if email was sent successfully</returns>
    Task<bool> SendStoreRejectionEmailAsync(string email, string storeName, string ownerName, string rejectionReason);

    /// <summary>
    /// Send store suspension notification email
    /// </summary>
    /// <param name="email">Store owner's email address</param>
    /// <param name="storeName">Name of the store</param>
    /// <param name="ownerName">Store owner's full name</param>
    /// <param name="suspensionReason">Reason for suspension</param>
    /// <returns>True if email was sent successfully</returns>
    Task<bool> SendStoreSuspensionEmailAsync(string email, string storeName, string ownerName, string suspensionReason);
}