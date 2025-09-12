namespace ECommerce.Application.DTOs;

public class ProductSearchRequest
{
    public string? SearchTerm { get; set; }
    public Guid? CategoryId { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool? InStockOnly { get; set; }
    public string? Gender { get; set; } // "women", "men", "unisex"
    public string? SortBy { get; set; } // "name", "price", "created", "popularity"
    public string? SortDirection { get; set; } // "asc", "desc"
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class ProductSearchResponse
{
    public IEnumerable<ProductDto> Products { get; set; } = new List<ProductDto>();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public ProductSearchFilters AvailableFilters { get; set; } = new();
}

public class ProductSearchFilters
{
    public IEnumerable<CategoryFilterDto> Categories { get; set; } = new List<CategoryFilterDto>();
    public PriceRangeDto PriceRange { get; set; } = new();
    public int TotalInStock { get; set; }
    public int TotalOutOfStock { get; set; }
}

public class CategoryFilterDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int ProductCount { get; set; }
}

public class PriceRangeDto
{
    public decimal MinPrice { get; set; }
    public decimal MaxPrice { get; set; }
}
