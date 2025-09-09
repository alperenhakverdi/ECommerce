using ECommerce.Domain.Entities;

namespace ECommerce.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRepository<Product> Products { get; }
    IRepository<Category> Categories { get; }
    IRepository<Cart> Carts { get; }
    IRepository<CartItem> CartItems { get; }
    IRepository<Order> Orders { get; }
    IRepository<OrderItem> OrderItems { get; }
    IRepository<Address> Addresses { get; }
    IRepository<RefreshToken> RefreshTokens { get; }
    IRepository<Store> Stores { get; }
    
    // Generic repository access
    IRepository<T> Repository<T>() where T : class;
    
    Task<int> SaveChangesAsync();
}