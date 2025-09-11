using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/uploads")]
public class UploadsController : ControllerBase
{
    private readonly ILogger<UploadsController> _logger;
    private readonly IWebHostEnvironment _env;
    private static readonly string[] AllowedImageExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

    public UploadsController(ILogger<UploadsController> logger, IWebHostEnvironment env)
    {
        _logger = logger;
        _env = env;
    }

    [HttpPost("images")]
    [Authorize]
    [RequestSizeLimit(10_000_000)] // 10 MB
    public async Task<IActionResult> UploadImage([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded");

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedImageExtensions.Contains(ext))
            return BadRequest("Unsupported file type. Allowed: jpg, jpeg, png, gif, webp");

        // Create target directory if not exists
        var webRoot = _env.WebRootPath;
        if (string.IsNullOrEmpty(webRoot))
        {
            webRoot = Path.Combine(_env.ContentRootPath, "wwwroot");
        }
        Directory.CreateDirectory(webRoot);
        var uploadsRoot = Path.Combine(webRoot, "uploads", "products");
        Directory.CreateDirectory(uploadsRoot);

        var fileName = $"{Guid.NewGuid()}{ext}";
        var fullPath = Path.Combine(uploadsRoot, fileName);

        await using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var url = $"{Request.Scheme}://{Request.Host}/uploads/products/{fileName}";
        _logger.LogInformation("Image uploaded: {Url}", url);
        return Ok(new { url });
    }
}
