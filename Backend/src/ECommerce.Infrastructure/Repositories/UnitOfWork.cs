using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using ECommerce.Infrastructure.Data;

namespace ECommerce.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ECommerceDbContext _context;
    private readonly Dictionary<Type, object> _repositories = new();
    
    public UnitOfWork(ECommerceDbContext context)
    {
        _context = context;
        
        Products = new Repository<Product>(_context);
        Categories = new Repository<Category>(_context);
        Carts = new Repository<Cart>(_context);
        CartItems = new Repository<CartItem>(_context);
        Orders = new Repository<Order>(_context);
        OrderItems = new Repository<OrderItem>(_context);
        Addresses = new Repository<Address>(_context);
        RefreshTokens = new Repository<RefreshToken>(_context);
        Stores = new Repository<Store>(_context);
    }

    public IRepository<Product> Products { get; }
    public IRepository<Category> Categories { get; }
    public IRepository<Cart> Carts { get; }
    public IRepository<CartItem> CartItems { get; }
    public IRepository<Order> Orders { get; }
    public IRepository<OrderItem> OrderItems { get; }
    public IRepository<Address> Addresses { get; }
    public IRepository<RefreshToken> RefreshTokens { get; }
    public IRepository<Store> Stores { get; }

    public IRepository<T> Repository<T>() where T : class
    {
        var type = typeof(T);
        if (_repositories.ContainsKey(type))
        {
            return (IRepository<T>)_repositories[type];
        }

        var repository = new Repository<T>(_context);
        _repositories.Add(type, repository);
        return repository;
    }

    public async Task<int> SaveChangesAsync()
    {
        // Update timestamps for entities that inherit from BaseEntity
        var entries = _context.ChangeTracker.Entries()
            .Where(e => e.Entity is Domain.Common.BaseEntity && 
                       (e.State == Microsoft.EntityFrameworkCore.EntityState.Added || 
                        e.State == Microsoft.EntityFrameworkCore.EntityState.Modified));

        foreach (var entry in entries)
        {
            if (entry.Entity is Domain.Common.BaseEntity entity)
            {
                if (entry.State == Microsoft.EntityFrameworkCore.EntityState.Added)
                {
                    entity.CreatedAt = DateTime.UtcNow;
                }
                else if (entry.State == Microsoft.EntityFrameworkCore.EntityState.Modified)
                {
                    entity.UpdatedAt = DateTime.UtcNow;
                }
            }
        }

        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}