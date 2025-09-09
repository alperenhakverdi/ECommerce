namespace ECommerce.Application.DTOs;

public class CartDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public List<CartItemDto> Items { get; set; } = new();
    public decimal TotalAmount { get; set; }
    public int TotalItems { get; set; }
}

public class CartItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductImage { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public decimal SubTotal { get; set; }
}

public class AddToCartDto
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; } = 1;
}

public class UpdateCartItemDto
{
    public int Quantity { get; set; }
}