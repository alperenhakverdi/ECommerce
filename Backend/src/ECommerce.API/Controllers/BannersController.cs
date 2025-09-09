using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BannersController : ControllerBase
{
    private readonly ILogger<BannersController> _logger;

    public BannersController(ILogger<BannersController> logger)
    {
        _logger = logger;
    }

    [HttpGet("active")]
    public ActionResult<IEnumerable<object>> GetActiveBanners()
    {
        try
        {
            _logger.LogInformation("Getting active banners");
            
            // Return modern banner data with real images
            var banners = new[]
            {
                new
                {
                    Id = Guid.NewGuid(),
                    Title = "Sonbahar İndirimleri",
                    Subtitle = "Seçili ürünlerde %50'ye varan indirim fırsatı",
                    Description = "Sezonun en trend parçalarını kaçırma! Binlerce üründe büyük indirimler seni bekliyor.",
                    ImageUrl = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop&crop=center",
                    CtaText = "İndirimleri Keşfet",
                    CtaLink = "/search?sale=true",
                    TextColor = "white",
                    BackgroundColor = "#FF6B6B",
                    IsActive = true,
                    DisplayOrder = 1
                },
                new
                {
                    Id = Guid.NewGuid(),
                    Title = "Yeni Koleksiyon",
                    Subtitle = "2024 Sonbahar/Kış Koleksiyonu Burada!",
                    Description = "En yeni trend ürünleri keşfet, tarzını yansıt. Modern tasarımlar artık mağazalarımızda.",
                    ImageUrl = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=400&fit=crop&crop=center",
                    CtaText = "Koleksiyonu Gör",
                    CtaLink = "/search?new=true",
                    TextColor = "white",
                    BackgroundColor = "#4ECDC4",
                    IsActive = true,
                    DisplayOrder = 2
                },
                new
                {
                    Id = Guid.NewGuid(),
                    Title = "Teknoloji Dünyası",
                    Subtitle = "En son teknoloji ürünleri burada",
                    Description = "Akıllı telefonlardan laptoplara, en yeni teknoloji ürünleri için doğru adrestesin.",
                    ImageUrl = "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=400&fit=crop&crop=center",
                    CtaText = "Teknoloji Ürünlerini İncele",
                    CtaLink = "/search?categoryId=11111111-1111-1111-1111-111111111111",
                    TextColor = "white", 
                    BackgroundColor = "#45B7D1",
                    IsActive = true,
                    DisplayOrder = 3
                },
                new
                {
                    Id = Guid.NewGuid(),
                    Title = "Ücretsiz Kargo",
                    Subtitle = "300 TL ve üzeri alışverişlerde",
                    Description = "Türkiye'nin her yerine hızlı ve güvenli teslimat. Ücretsiz kargo avantajını kaçırma!",
                    ImageUrl = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=400&fit=crop&crop=center",
                    CtaText = "Hemen Alışveriş Yap",
                    CtaLink = "/search",
                    TextColor = "white",
                    BackgroundColor = "#9C27B0",
                    IsActive = true,
                    DisplayOrder = 4
                }
            };

            return Ok(banners);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting active banners");
            return StatusCode(500, "Internal server error");
        }
    }
}