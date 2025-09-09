using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using ECommerce.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Services;

public class CartService : ICartService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ECommerceDbContext _context;

    public CartService(IUnitOfWork unitOfWork, ECommerceDbContext context)
    {
        _unitOfWork = unitOfWork;
        _context = context;
    }

    public async Task<CartDto> GetCartAsync(Guid userId)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(ci => ci.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
        {
            cart = new Cart { UserId = userId };
            await _unitOfWork.Carts.AddAsync(cart);
            await _unitOfWork.SaveChangesAsync();
        }

        var cartDto = new CartDto
        {
            Id = cart.Id,
            UserId = cart.UserId,
            Items = cart.Items.Select(ci => new CartItemDto
            {
                Id = ci.Id,
                ProductId = ci.ProductId,
                ProductName = ci.Product.Name,
                ProductImage = ci.Product.ImageUrl,
                Price = ci.Price,
                Quantity = ci.Quantity,
                SubTotal = ci.Price * ci.Quantity
            }).ToList()
        };

        cartDto.TotalAmount = cartDto.Items.Sum(i => i.SubTotal);
        cartDto.TotalItems = cartDto.Items.Sum(i => i.Quantity);

        return cartDto;
    }

    public async Task<CartDto> AddToCartAsync(Guid userId, AddToCartDto addToCartDto)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
        {
            cart = new Cart { UserId = userId };
            await _unitOfWork.Carts.AddAsync(cart);
            await _unitOfWork.SaveChangesAsync();
        }

        var product = await _unitOfWork.Products.GetByIdAsync(addToCartDto.ProductId);
        if (product == null || !product.IsActive || product.Stock < addToCartDto.Quantity)
        {
            throw new InvalidOperationException("Product not available or insufficient stock");
        }

        var existingCartItem = cart.Items.FirstOrDefault(ci => ci.ProductId == addToCartDto.ProductId);

        if (existingCartItem != null)
        {
            existingCartItem.Quantity += addToCartDto.Quantity;
            await _unitOfWork.CartItems.UpdateAsync(existingCartItem);
        }
        else
        {
            var cartItem = new CartItem
            {
                CartId = cart.Id,
                ProductId = addToCartDto.ProductId,
                Quantity = addToCartDto.Quantity,
                Price = product.Price
            };

            await _unitOfWork.CartItems.AddAsync(cartItem);
        }

        await _unitOfWork.SaveChangesAsync();

        return await GetCartAsync(userId);
    }

    public async Task<CartDto?> UpdateCartItemAsync(Guid userId, Guid cartItemId, UpdateCartItemDto updateCartItemDto)
    {
        var cartItem = await _context.CartItems
            .Include(ci => ci.Cart)
            .Include(ci => ci.Product)
            .FirstOrDefaultAsync(ci => ci.Id == cartItemId && ci.Cart.UserId == userId);

        if (cartItem == null) return null;

        if (updateCartItemDto.Quantity <= 0)
        {
            await _unitOfWork.CartItems.DeleteAsync(cartItemId);
        }
        else
        {
            if (cartItem.Product.Stock < updateCartItemDto.Quantity)
            {
                throw new InvalidOperationException("Insufficient stock");
            }

            cartItem.Quantity = updateCartItemDto.Quantity;
            await _unitOfWork.CartItems.UpdateAsync(cartItem);
        }

        await _unitOfWork.SaveChangesAsync();

        return await GetCartAsync(userId);
    }

    public async Task<bool> RemoveFromCartAsync(Guid userId, Guid cartItemId)
    {
        var cartItem = await _context.CartItems
            .Include(ci => ci.Cart)
            .FirstOrDefaultAsync(ci => ci.Id == cartItemId && ci.Cart.UserId == userId);

        if (cartItem == null) return false;

        await _unitOfWork.CartItems.DeleteAsync(cartItemId);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ClearCartAsync(Guid userId)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null) return false;

        foreach (var item in cart.Items)
        {
            await _unitOfWork.CartItems.DeleteAsync(item.Id);
        }

        await _unitOfWork.SaveChangesAsync();

        return true;
    }
}