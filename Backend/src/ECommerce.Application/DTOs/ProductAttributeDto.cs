namespace ECommerce.Application.DTOs;

public class ProductAttributeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public AttributeType Type { get; set; }
    public bool IsRequired { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    
    public List<ProductAttributeValueDto> Values { get; set; } = new();
}

public class ProductAttributeValueDto
{
    public Guid Id { get; set; }
    public Guid ProductAttributeId { get; set; }
    public string Value { get; set; } = string.Empty;
    public string? ColorCode { get; set; }
    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}

// Request DTOs
public class CreateProductAttributeRequest
{
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public AttributeType Type { get; set; }
    public bool IsRequired { get; set; }
    public int SortOrder { get; set; }
    
    public List<CreateProductAttributeValueRequest> Values { get; set; } = new();
}

public class CreateProductAttributeValueRequest
{
    public string Value { get; set; } = string.Empty;
    public string? ColorCode { get; set; }
    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; }
}