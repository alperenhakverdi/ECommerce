using ECommerce.Application.Interfaces;
using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System.Text;

namespace ECommerce.Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private readonly ILogger<SmtpEmailService> _logger;
    private readonly SmtpConfig _config;

    public SmtpEmailService(ILogger<SmtpEmailService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _config = new SmtpConfig();
        
        _config.SmtpServer = configuration["SmtpConfig:SmtpServer"] ?? "localhost";
        _config.Port = int.Parse(configuration["SmtpConfig:Port"] ?? "587");
        _config.Username = configuration["SmtpConfig:Username"] ?? "";
        _config.Password = configuration["SmtpConfig:Password"] ?? "";
        _config.FromEmail = configuration["SmtpConfig:FromEmail"] ?? "noreply@ecommerce.local";
        _config.DisplayName = configuration["SmtpConfig:DisplayName"] ?? "ECommerce";
        _config.UseSsl = bool.Parse(configuration["SmtpConfig:UseSsl"] ?? "true");
        _config.FrontendUrl = configuration["SmtpConfig:FrontendUrl"] ?? "http://localhost:3000";
    }

    public async Task<bool> SendEmailAsync(string to, string subject, string body, bool isHtml = true)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_config.DisplayName, _config.FromEmail));
            message.To.Add(new MailboxAddress("", to));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder();
            if (isHtml)
            {
                bodyBuilder.HtmlBody = body;
            }
            else
            {
                bodyBuilder.TextBody = body;
            }
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            
            // Configure security options
            client.CheckCertificateRevocation = false;
            
            await client.ConnectAsync(_config.SmtpServer, _config.Port, _config.UseSsl);
            
            if (!string.IsNullOrEmpty(_config.Username))
            {
                await client.AuthenticateAsync(_config.Username, _config.Password);
            }
            
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Email sent successfully to {EmailAddress} with subject: {Subject}", to, subject);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {EmailAddress} with subject: {Subject}", to, subject);
            return false;
        }
    }

    public async Task<bool> SendPasswordResetEmailAsync(string email, string resetToken, string userName)
    {
        var subject = "Password Reset Request - ECommerce";
        var body = GeneratePasswordResetEmailBody(userName, resetToken, email);
        
        return await SendEmailAsync(email, subject, body);
    }

    public async Task<bool> SendOrderConfirmationEmailAsync(string email, string orderId, object orderDetails)
    {
        var subject = $"Order Confirmation - Order #{orderId}";
        var body = GenerateOrderConfirmationEmailBody(orderId, orderDetails);
        
        return await SendEmailAsync(email, subject, body);
    }

    public async Task<bool> SendEmailVerificationAsync(string email, string verificationToken, string userName)
    {
        var subject = "Verify Your Email Address - ECommerce";
        var body = GenerateEmailVerificationBody(userName, verificationToken, email);
        
        return await SendEmailAsync(email, subject, body);
    }

    public async Task<bool> SendStoreApprovalEmailAsync(string email, string storeName, string ownerName)
    {
        var subject = $"🎉 Tebrikler! {storeName} Mağazanız Onaylandı - ECommerce";
        var body = GenerateStoreApprovalEmailBody(storeName, ownerName);
        
        return await SendEmailAsync(email, subject, body);
    }

    public async Task<bool> SendStoreRejectionEmailAsync(string email, string storeName, string ownerName, string rejectionReason)
    {
        var subject = $"Mağaza Başvurunuz Hakkında - {storeName}";
        var body = GenerateStoreRejectionEmailBody(storeName, ownerName, rejectionReason);
        
        return await SendEmailAsync(email, subject, body);
    }

    public async Task<bool> SendStoreSuspensionEmailAsync(string email, string storeName, string ownerName, string suspensionReason)
    {
        var subject = $"Önemli: {storeName} Mağazanız Geçici Olarak Askıya Alındı";
        var body = GenerateStoreSuspensionEmailBody(storeName, ownerName, suspensionReason);
        
        return await SendEmailAsync(email, subject, body);
    }

    private string GeneratePasswordResetEmailBody(string userName, string resetToken, string email)
    {
        var resetUrl = $"{_config.FrontendUrl}/reset-password?token={resetToken}&email={Uri.EscapeDataString(email)}";
        
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Password Reset Request</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }}
        .button {{ display: inline-block; padding: 12px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .button:hover {{ background: #0056b3; }}
        .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 20px; }}
        .warning {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }}
    </style>
</head>
<body>
    <div class='header'>
        <h1>🔒 Password Reset Request</h1>
    </div>
    <div class='content'>
        <p>Hello <strong>{userName}</strong>,</p>
        
        <p>We received a request to reset your password for your ECommerce account. If you made this request, click the button below to reset your password:</p>
        
        <div style='text-align: center;'>
            <a href='{resetUrl}' class='button'>Reset Password</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style='word-break: break-all; color: #007bff;'>{resetUrl}</p>
        
        <div class='warning'>
            <strong>⚠️ Security Notice:</strong>
            <ul>
                <li>This link will expire in 1 hour for security reasons</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Never share this link with anyone</li>
            </ul>
        </div>
        
        <p>If you have any questions or concerns, please contact our support team.</p>
        
        <p>Best regards,<br>The ECommerce Team</p>
    </div>
    <div class='footer'>
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>© 2024 ECommerce. All rights reserved.</p>
    </div>
</body>
</html>";
    }

    private string GenerateOrderConfirmationEmailBody(string orderId, object orderDetails)
    {
        // Parse the order details from the dynamic object
        dynamic details = orderDetails;
        var customerName = details?.CustomerName ?? "Valued Customer";
        var totalAmount = details?.TotalAmount ?? 0m;
        var orderDate = details?.OrderDate ?? DateTime.UtcNow;
        var status = details?.Status ?? "Processing";
        
        var itemsHtml = "";
        if (details?.Items != null)
        {
            foreach (var item in details.Items)
            {
                itemsHtml += $@"
                <tr>
                    <td style='padding: 10px; border-bottom: 1px solid #ddd;'>{item.ProductName}</td>
                    <td style='padding: 10px; border-bottom: 1px solid #ddd; text-align: center;'>{item.Quantity}</td>
                    <td style='padding: 10px; border-bottom: 1px solid #ddd; text-align: right;'>${item.Price:F2}</td>
                    <td style='padding: 10px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;'>${item.Total:F2}</td>
                </tr>";
            }
        }

        var shippingAddressHtml = "";
        if (details?.ShippingAddress != null)
        {
            var address = details.ShippingAddress;
            shippingAddressHtml = $@"
            <div class='address-box'>
                <h4>📍 Shipping Address</h4>
                <p>{address.FirstName} {address.LastName}<br>
                {address.Street}<br>
                {address.City}, {address.State} {address.ZipCode}<br>
                {address.Country}</p>
            </div>";
        }
        
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Order Confirmation</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }}
        .order-box {{ background: white; border: 2px solid #28a745; border-radius: 8px; padding: 20px; margin: 20px 0; }}
        .address-box {{ background: #e8f5e8; border: 1px solid #28a745; border-radius: 5px; padding: 15px; margin: 15px 0; }}
        .items-table {{ width: 100%; border-collapse: collapse; margin: 15px 0; background: white; }}
        .items-table th {{ background: #28a745; color: white; padding: 12px; text-align: left; }}
        .items-table td {{ padding: 10px; border-bottom: 1px solid #ddd; }}
        .total-row {{ background: #f0f8f0; font-weight: bold; }}
        .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 20px; }}
        .tracking-info {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }}
    </style>
</head>
<body>
    <div class='header'>
        <h1>✅ Order Confirmed!</h1>
        <h2>Order #{orderId}</h2>
    </div>
    <div class='content'>
        <p>Hello <strong>{customerName}</strong>,</p>
        
        <p>Thank you for your order! We've received your order and it's being processed. Here are your order details:</p>
        
        <div class='order-box'>
            <h3>📦 Order Summary</h3>
            <table style='width: 100%; border-collapse: collapse;'>
                <tr>
                    <td style='padding: 8px 0; font-weight: bold;'>Order ID:</td>
                    <td style='padding: 8px 0;'>{orderId}</td>
                </tr>
                <tr>
                    <td style='padding: 8px 0; font-weight: bold;'>Order Date:</td>
                    <td style='padding: 8px 0;'>{orderDate:MMMM dd, yyyy 'at' HH:mm}</td>
                </tr>
                <tr>
                    <td style='padding: 8px 0; font-weight: bold;'>Status:</td>
                    <td style='padding: 8px 0; color: #28a745; font-weight: bold;'>{status}</td>
                </tr>
                <tr>
                    <td style='padding: 8px 0; font-weight: bold;'>Total Amount:</td>
                    <td style='padding: 8px 0; font-size: 18px; color: #28a745; font-weight: bold;'>${totalAmount:F2}</td>
                </tr>
            </table>
        </div>

        <div class='order-box'>
            <h3>🛒 Order Items</h3>
            <table class='items-table'>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th style='text-align: center;'>Qty</th>
                        <th style='text-align: right;'>Price</th>
                        <th style='text-align: right;'>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {itemsHtml}
                    <tr class='total-row'>
                        <td colspan='3' style='text-align: right; padding: 15px;'>Order Total:</td>
                        <td style='text-align: right; padding: 15px; font-size: 18px; color: #28a745;'>${totalAmount:F2}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        {shippingAddressHtml}
        
        <div class='tracking-info'>
            <h4>📦 What's Next?</h4>
            <ul>
                <li>Your order is being prepared for shipment</li>
                <li>You'll receive a tracking number when your order ships</li>
                <li>Estimated delivery: 3-5 business days</li>
                <li>Questions? Contact our support team anytime</li>
            </ul>
        </div>
        
        <p>If you have any questions about your order, please don't hesitate to contact our customer service team. We're here to help!</p>
        
        <p>Thank you for choosing ECommerce!</p>
        
        <p>Best regards,<br>The ECommerce Team</p>
    </div>
    <div class='footer'>
        <p>This is an automated confirmation email. Please keep it for your records.</p>
        <p>© 2024 ECommerce. All rights reserved.</p>
    </div>
</body>
</html>";
    }

    private string GenerateEmailVerificationBody(string userName, string verificationToken, string email)
    {
        var verifyUrl = $"{_config.FrontendUrl}/verify-email?token={verificationToken}&email={Uri.EscapeDataString(email)}";
        
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Verify Your Email</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #6610f2 0%, #6f42c1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }}
        .button {{ display: inline-block; padding: 12px 30px; background: #6610f2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .button:hover {{ background: #520dc2; }}
        .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 20px; }}
    </style>
</head>
<body>
    <div class='header'>
        <h1>📧 Verify Your Email</h1>
    </div>
    <div class='content'>
        <p>Hello <strong>{userName}</strong>,</p>
        
        <p>Welcome to ECommerce! Please verify your email address to activate your account:</p>
        
        <div style='text-align: center;'>
            <a href='{verifyUrl}' class='button'>Verify Email Address</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style='word-break: break-all; color: #6610f2;'>{verifyUrl}</p>
        
        <p>If you didn't create an account with us, please ignore this email.</p>
        
        <p>Best regards,<br>The ECommerce Team</p>
    </div>
    <div class='footer'>
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>© 2024 ECommerce. All rights reserved.</p>
    </div>
</body>
</html>";
    }

    private string GenerateStoreApprovalEmailBody(string storeName, string ownerName)
    {
        var dashboardUrl = $"{_config.FrontendUrl}/store/dashboard";
        
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Mağazanız Onaylandı!</title>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; padding: 20px; background: #f5f5f5; }}
        .email-container {{ background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }}
        .header {{ background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 40px 30px; text-align: center; }}
        .header h1 {{ margin: 0; font-size: 28px; font-weight: bold; }}
        .content {{ padding: 40px 30px; }}
        .celebration {{ text-align: center; font-size: 48px; margin: 20px 0; }}
        .info-box {{ background: #f8f9fa; border-left: 5px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 5px; }}
        .button {{ display: inline-block; padding: 15px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; font-size: 16px; text-align: center; }}
        .button:hover {{ background: #218838; }}
        .features {{ background: #e8f5e8; border-radius: 10px; padding: 25px; margin: 25px 0; }}
        .features h3 {{ color: #28a745; margin-top: 0; }}
        .features ul {{ list-style-type: none; padding-left: 0; }}
        .features li {{ margin: 10px 0; padding-left: 25px; position: relative; }}
        .features li:before {{ content: '✅'; position: absolute; left: 0; }}
        .next-steps {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        .footer {{ text-align: center; color: #666; font-size: 12px; padding: 20px; background: #f8f9fa; }}
        .support-box {{ background: #e3f2fd; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; }}
    </style>
</head>
<body>
    <div class='email-container'>
        <div class='header'>
            <div class='celebration'>🎉</div>
            <h1>Tebrikler {ownerName}!</h1>
            <h2>Mağazanız Onaylandı</h2>
        </div>
        <div class='content'>
            <p>Merhaba <strong>{ownerName}</strong>,</p>
            
            <div class='info-box'>
                <h3>🏪 Harika Haber!</h3>
                <p><strong>{storeName}</strong> adlı mağazanızın başvurusu başarıyla onaylandı! Artık ECommerce platformumuzda satış yapabilirsiniz.</p>
            </div>
            
            <div style='text-align: center; margin: 30px 0;'>
                <a href='{dashboardUrl}' class='button'>🚀 Mağaza Yönetim Paneline Git</a>
            </div>
            
            <div class='features'>
                <h3>🎯 Şimdi Neler Yapabilirsiniz?</h3>
                <ul>
                    <li><strong>Ürün Ekleme:</strong> Katalog yönetim paneli ile kolayca ürünlerinizi ekleyin</li>
                    <li><strong>Sipariş Yönetimi:</strong> Gelen siparişleri takip edin ve yönetin</li>
                    <li><strong>Stok Kontrolü:</strong> Ürün stoklarınızı gerçek zamanlı izleyin</li>
                    <li><strong>Satış Analitiği:</strong> Detaylı satış raporları ve istatistiklerini görün</li>
                    <li><strong>Müşteri İletişimi:</strong> Müşteri yorumları ve mesajlarını yönetin</li>
                    <li><strong>Promosyon Yönetimi:</strong> İndirim kampanyaları ve özel teklifler oluşturun</li>
                </ul>
            </div>
            
            <div class='next-steps'>
                <h4>📝 Sonraki Adımlar:</h4>
                <ol>
                    <li><strong>Mağaza Profili:</strong> Logo, açıklama ve iletişim bilgilerinizi tamamlayın</li>
                    <li><strong>İlk Ürün:</strong> En az 5 ürün ekleyerek satışa başlayın</li>
                    <li><strong>Ödeme Bilgileri:</strong> Banka hesap bilgilerinizi güncelleyin</li>
                    <li><strong>Kargo Anlaşmaları:</strong> Kargo firmaları ile entegrasyonunuzu tamamlayın</li>
                    <li><strong>Müşteri Politikaları:</strong> İade, değişim ve garanti politikalarınızı belirleyin</li>
                </ol>
            </div>
            
            <div class='support-box'>
                <h4>🤝 Destek ve Yardım</h4>
                <p>Herhangi bir sorunuz var mı? Satıcı Destek ekibimiz size yardımcı olmak için burada!</p>
                <p>📞 Telefon: +90 (212) 555-0123<br>
                📧 E-posta: seller-support@ecommerce.com<br>
                💬 Canlı Destek: 7/24 hizmetinizdeyiz</p>
            </div>
            
            <p>ECommerce ailesine hoş geldiniz! Başarılı satışlar dileriz.</p>
            
            <p>Saygılarımızla,<br>
            <strong>ECommerce Satıcı Ekibi</strong><br>
            🏪 Türkiye'nin En Büyük E-Ticaret Platformu</p>
        </div>
        <div class='footer'>
            <p>Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
            <p>📍 ECommerce A.Ş. - İstanbul, Türkiye | © 2024 Tüm Hakları Saklıdır</p>
        </div>
    </div>
</body>
</html>";
    }

    private string GenerateStoreRejectionEmailBody(string storeName, string ownerName, string rejectionReasonJson)
    {
        // Parse the structured rejection reason
        var category = "";
        var categoryLabel = "";
        var reason = rejectionReasonJson;
        var timestamp = DateTime.UtcNow.ToString("dd.MM.yyyy HH:mm");
        
        try
        {
            if (rejectionReasonJson.StartsWith("{"))
            {
                dynamic reasonData = Newtonsoft.Json.JsonConvert.DeserializeObject(rejectionReasonJson);
                category = reasonData?.category ?? "";
                categoryLabel = reasonData?.categoryLabel ?? "";
                reason = reasonData?.reason ?? rejectionReasonJson;
                timestamp = reasonData?.timestamp != null 
                    ? DateTime.Parse(reasonData.timestamp.ToString()).ToString("dd.MM.yyyy HH:mm")
                    : DateTime.UtcNow.ToString("dd.MM.yyyy HH:mm");
            }
        }
        catch
        {
            // Fallback to plain text if JSON parsing fails
            reason = rejectionReasonJson;
        }
        
        var reapplyUrl = $"{_config.FrontendUrl}/register";
        
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Mağaza Başvuru Sonucu</title>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; padding: 20px; background: #f5f5f5; }}
        .email-container {{ background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }}
        .header {{ background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 40px 30px; text-align: center; }}
        .header h1 {{ margin: 0; font-size: 24px; font-weight: bold; }}
        .content {{ padding: 40px 30px; }}
        .info-box {{ background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 20px; margin: 20px 0; }}
        .reason-box {{ background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; }}
        .category-badge {{ display: inline-block; background: #dc3545; color: white; padding: 5px 12px; border-radius: 15px; font-size: 12px; font-weight: bold; margin-bottom: 10px; }}
        .improvements-box {{ background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; margin: 20px 0; }}
        .improvements-box h4 {{ color: #0c5460; margin-top: 0; }}
        .improvements-box ul {{ list-style-type: none; padding-left: 0; }}
        .improvements-box li {{ margin: 8px 0; padding-left: 25px; position: relative; }}
        .improvements-box li:before {{ content: '📝'; position: absolute; left: 0; }}
        .button {{ display: inline-block; padding: 15px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; text-align: center; }}
        .button:hover {{ background: #0056b3; }}
        .support-box {{ background: #e8f5e8; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; }}
        .footer {{ text-align: center; color: #666; font-size: 12px; padding: 20px; background: #f8f9fa; }}
        .timeline {{ font-size: 12px; color: #666; text-align: right; margin-top: 10px; }}
    </style>
</head>
<body>
    <div class='email-container'>
        <div class='header'>
            <h1>Mağaza Başvuru Sonucu</h1>
            <h2>{storeName}</h2>
        </div>
        <div class='content'>
            <p>Sayın <strong>{ownerName}</strong>,</p>
            
            <div class='info-box'>
                <h3>📋 Başvuru Durumu</h3>
                <p>ECommerce platformunda <strong>{storeName}</strong> adlı mağazanız için yaptığınız başvuru inceleme sürecinden geçmiştir.</p>
                <p><strong>Maalesef bu aşamada başvurunuzu onaylayamadık.</strong></p>
            </div>
            
            {(string.IsNullOrEmpty(categoryLabel) ? "" : $@"
            <div class='reason-box'>
                <div class='category-badge'>{categoryLabel}</div>
                <h4>🔍 Detaylı Açıklama:</h4>
                <p><strong>{reason}</strong></p>
                <div class='timeline'>Değerlendirme Tarihi: {timestamp}</div>
            </div>")}
            
            {(string.IsNullOrEmpty(categoryLabel) ? $@"
            <div class='reason-box'>
                <h4>🔍 Red Sebebi:</h4>
                <p><strong>{reason}</strong></p>
                <div class='timeline'>Değerlendirme Tarihi: {timestamp}</div>
            </div>" : "")}
            
            <div class='improvements-box'>
                <h4>✨ Yeniden Başvuru İçin Öneriler</h4>
                <ul>
                    <li><strong>Eksiklikleri Giderin:</strong> Yukarıda belirtilen konularda iyileştirmeler yapın</li>
                    <li><strong>Belgeleri Güncelleyin:</strong> Gerekli tüm belgelerin geçerli ve eksiksiz olduğundan emin olun</li>
                    <li><strong>İş Planınızı Geliştirin:</strong> Platform politikalarına uygun iş modeli oluşturun</li>
                    <li><strong>Kalite Standartları:</strong> Ürün ve hizmet kalitesi kriterlerini gözden geçirin</li>
                    <li><strong>Teknik Hazırlık:</strong> E-ticaret operasyonları için gerekli altyapıyı hazırlayın</li>
                </ul>
            </div>
            
            <div style='text-align: center; margin: 30px 0;'>
                <a href='{reapplyUrl}' class='button'>🔄 Yeniden Başvur</a>
            </div>
            
            <div class='support-box'>
                <h4>🤝 Destek ve Rehberlik</h4>
                <p>Başvuru süreciyle ilgili sorularınız için bizimle iletişime geçebilirsiniz:</p>
                <p>📞 Başvuru Destek Hattı: +90 (212) 555-0100<br>
                📧 E-posta: applications@ecommerce.com<br>
                🕒 Çalışma Saatleri: Hafta içi 09:00-18:00</p>
            </div>
            
            <p>ECommerce platformuna olan ilginiz için teşekkür eder, gelecekteki başvurunuzda başarılar dileriz.</p>
            
            <p>Saygılarımızla,<br>
            <strong>ECommerce Satıcı Onay Ekibi</strong><br>
            🏪 Türkiye'nin En Büyük E-Ticaret Platformu</p>
        </div>
        <div class='footer'>
            <p>Bu e-posta otomatik olarak gönderilmiştir. Sorularınız için yukarıdaki iletişim bilgilerini kullanın.</p>
            <p>📍 ECommerce A.Ş. - İstanbul, Türkiye | © 2024 Tüm Hakları Saklıdır</p>
        </div>
    </div>
</body>
</html>";
    }

    private string GenerateStoreSuspensionEmailBody(string storeName, string ownerName, string suspensionReason)
    {
        var appealUrl = $"{_config.FrontendUrl}/store/appeal";
        var dashboardUrl = $"{_config.FrontendUrl}/store/dashboard";
        
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Önemli: Mağaza Askıya Alma Bildirimi</title>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; padding: 20px; background: #f5f5f5; }}
        .email-container {{ background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }}
        .header {{ background: linear-gradient(135deg, #ffc107 0%, #ff8f00 100%); color: #333; padding: 40px 30px; text-align: center; }}
        .header h1 {{ margin: 0; font-size: 24px; font-weight: bold; }}
        .content {{ padding: 40px 30px; }}
        .warning-box {{ background: #fff3cd; border: 2px solid #ffecb5; border-radius: 8px; padding: 20px; margin: 20px 0; }}
        .reason-box {{ background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 20px; margin: 20px 0; }}
        .action-box {{ background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; margin: 20px 0; }}
        .action-box h4 {{ color: #0c5460; margin-top: 0; }}
        .action-box ul {{ list-style-type: none; padding-left: 0; }}
        .action-box li {{ margin: 8px 0; padding-left: 25px; position: relative; }}
        .action-box li:before {{ content: '📋'; position: absolute; left: 0; }}
        .button {{ display: inline-block; padding: 15px 30px; background: #dc3545; color: white; text-decoration: none; border-radius: 8px; margin: 10px 5px; font-weight: bold; text-align: center; }}
        .button.secondary {{ background: #6c757d; }}
        .button:hover {{ opacity: 0.9; }}
        .consequences-box {{ background: #f8f9fa; border-left: 5px solid #dc3545; padding: 20px; margin: 20px 0; }}
        .footer {{ text-align: center; color: #666; font-size: 12px; padding: 20px; background: #f8f9fa; }}
        .urgent {{ color: #dc3545; font-weight: bold; }}
    </style>
</head>
<body>
    <div class='email-container'>
        <div class='header'>
            <div style='font-size: 48px; margin-bottom: 10px;'>⚠️</div>
            <h1>Önemli Bildirim</h1>
            <h2>{storeName}</h2>
        </div>
        <div class='content'>
            <p>Sayın <strong>{ownerName}</strong>,</p>
            
            <div class='warning-box'>
                <h3 class='urgent'>🚨 Mağazanız Geçici Olarak Askıya Alındı</h3>
                <p>Bu e-posta, <strong>{storeName}</strong> adlı mağazanızın ECommerce platformunda geçici olarak askıya alındığını bildirmek için gönderilmiştir.</p>
            </div>
            
            <div class='reason-box'>
                <h4>🔍 Askıya Alma Sebebi:</h4>
                <p><strong>{suspensionReason}</strong></p>
            </div>
            
            <div class='consequences-box'>
                <h4>📋 Bu Durum Ne Anlama Geliyor?</h4>
                <ul>
                    <li>Mağazanız müşterilere görünmez durumda</li>
                    <li>Yeni siparişler alınamıyor</li>
                    <li>Mevcut siparişler etkilenmeyecek</li>
                    <li>Mağaza yönetim paneli erişiminiz devam ediyor</li>
                    <li>Askıya alma geçici bir önlemdir</li>
                </ul>
            </div>
            
            <div class='action-box'>
                <h4>✅ Yapmanız Gerekenler</h4>
                <ul>
                    <li><strong>Sorunu Tespit Edin:</strong> Askıya alma sebebini detaylı inceleyin</li>
                    <li><strong>Gerekli Düzeltmeleri Yapın:</strong> Belirtilen konularda iyileştirmeler gerçekleştirin</li>
                    <li><strong>Destekle İletişime Geçin:</strong> Sorularınız için destek ekibimizle konuşun</li>
                    <li><strong>İtiraz Dilekçesi:</strong> Gerekirse formal itiraz sürecini başlatın</li>
                    <li><strong>Politikaları Gözden Geçirin:</strong> Platform kurallarını yeniden okuyun</li>
                </ul>
            </div>
            
            <div style='text-align: center; margin: 30px 0;'>
                <a href='{dashboardUrl}' class='button'>🏪 Mağaza Paneline Git</a>
                <a href='{appealUrl}' class='button secondary'>📝 İtiraz Et</a>
            </div>
            
            <div class='warning-box'>
                <h4>⏰ Önemli Zaman Çizelgesi</h4>
                <p><strong>14 gün</strong> içerisinde sorunu çözmeniz ve gerekli iyileştirmeleri yapmanız gerekmektedir. Bu süre zarfında:</p>
                <ul>
                    <li>Destek ekibimizle aktif iletişim kurabilirsiniz</li>
                    <li>Mağaza ayarlarınızı düzenleyebilirsiniz</li>
                    <li>İtiraz sürecini başlatabilirsiniz</li>
                </ul>
                <p><span class='urgent'>Dikkat:</span> 14 günlük süre sonunda sorun çözülmezse mağaza kalıcı olarak kapatılabilir.</p>
            </div>
            
            <div class='action-box'>
                <h4>🤝 Destek ve Yardım</h4>
                <p>Bu süreçte size yardımcı olmak için buradayız:</p>
                <p>🆘 <strong>Acil Destek Hattı:</strong> +90 (212) 555-0911<br>
                📧 <strong>E-posta:</strong> urgent-support@ecommerce.com<br>
                💬 <strong>Canlı Destek:</strong> 7/24 hizmetinizde<br>
                📋 <strong>İtiraz Formu:</strong> appeal@ecommerce.com</p>
            </div>
            
            <p>Bu durumun geçici olduğunu ve birlikte çözüm bulabileceğimizi umuyoruz. Sorunları çözdükten sonra mağazanız tekrar aktif hale getirilecektir.</p>
            
            <p>Anlayışınız için teşekkür ederiz.</p>
            
            <p>Saygılarımızla,<br>
            <strong>ECommerce Platform Yönetimi</strong><br>
            🏪 Güvenli E-Ticaret İçin</p>
        </div>
        <div class='footer'>
            <p>Bu e-posta güvenlik amaçlı gönderilmiştir. Acil durumlar için yukarıdaki iletişim kanallarını kullanın.</p>
            <p>📍 ECommerce A.Ş. - İstanbul, Türkiye | © 2024 Tüm Hakları Saklıdır</p>
        </div>
    </div>
</body>
</html>";
    }
}

public class SmtpConfig
{
    public string SmtpServer { get; set; } = "localhost";
    public int Port { get; set; } = 587;
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
    public string FromEmail { get; set; } = "noreply@ecommerce.local";
    public string DisplayName { get; set; } = "ECommerce";
    public bool UseSsl { get; set; } = true;
    public string FrontendUrl { get; set; } = "http://localhost:3000";
}