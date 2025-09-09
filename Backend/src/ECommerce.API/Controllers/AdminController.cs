using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using ECommerce.Domain.Interfaces;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Entities;
using ECommerce.Application.Interfaces;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AdminController> _logger;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly IStoreService _storeService;

    public AdminController(
        IUnitOfWork unitOfWork, 
        ILogger<AdminController> logger,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole<Guid>> roleManager,
        IStoreService storeService)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _userManager = userManager;
        _roleManager = roleManager;
        _storeService = storeService;
    }

    [HttpGet("dashboard/stats")]
    public async Task<ActionResult> GetDashboardStats()
    {
        try
        {
            var orders = await _unitOfWork.Orders.GetAllAsync();
            var products = await _unitOfWork.Products.GetAllAsync();
            var users = await _unitOfWork.Repository<Domain.Entities.ApplicationUser>()
                .GetQueryable()
                .Where(u => u.Email != null)
                .ToListAsync();

            var totalOrders = orders.Count();
            var totalRevenue = orders.Sum(o => o.TotalAmount);
            var totalProducts = products.Count(p => p.IsActive);
            var totalCustomers = users.Count();

            // Order status counts
            var pendingOrders = orders.Count(o => o.Status == OrderStatus.Pending);
            var paidOrders = orders.Count(o => o.Status == OrderStatus.Paid);
            var shippedOrders = orders.Count(o => o.Status == OrderStatus.Shipped);
            var deliveredOrders = orders.Count(o => o.Status == OrderStatus.Delivered);
            var cancelledOrders = orders.Count(o => o.Status == OrderStatus.Cancelled);

            var averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            // Get recent orders (last 10)
            var recentOrders = orders
                .OrderByDescending(o => o.CreatedAt)
                .Take(10)
                .Select(o => new
                {
                    id = o.Id.ToString(),
                    customerName = o.CustomerName,
                    customerEmail = o.CustomerEmail,
                    totalAmount = o.TotalAmount,
                    status = (int)o.Status,
                    createdAt = o.CreatedAt
                })
                .ToList();

            // Simulate top selling products (in real app, this would be calculated from order items)
            var topSellingProducts = products
                .Where(p => p.IsActive)
                .Take(5)
                .Select(p => new
                {
                    id = p.Id.ToString(),
                    name = p.Name,
                    totalSold = Random.Shared.Next(10, 100), // Simulated
                    revenue = Random.Shared.Next(500, 5000) // Simulated
                })
                .ToList();

            var dashboardStats = new
            {
                totalOrders,
                totalRevenue,
                totalProducts,
                totalCustomers,
                pendingOrders,
                paidOrders,
                shippedOrders,
                deliveredOrders,
                cancelledOrders,
                averageOrderValue,
                topSellingProducts,
                recentOrders
            };

            return Ok(dashboardStats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving dashboard stats");
            return StatusCode(500, new { message = "An error occurred while retrieving dashboard stats" });
        }
    }

    [HttpGet("orders")]
    public async Task<ActionResult> GetAllOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var allOrders = await _unitOfWork.Orders.GetAllAsync();
            
            var totalOrders = allOrders.Count();
            var orders = allOrders
                .OrderByDescending(o => o.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(o => new
                {
                    id = o.Id.ToString(),
                    customerName = o.CustomerName,
                    customerEmail = o.CustomerEmail,
                    totalAmount = o.TotalAmount,
                    status = (int)o.Status,
                    statusName = o.Status.ToString(),
                    createdAt = o.CreatedAt,
                    itemsCount = o.Items?.Count ?? 0
                })
                .ToList();

            return Ok(new
            {
                orders,
                totalOrders,
                currentPage = page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)totalOrders / pageSize)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all orders");
            return StatusCode(500, new { message = "An error occurred while retrieving orders" });
        }
    }

    [HttpPatch("orders/{id}/status")]
    public async Task<ActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusRequest request)
    {
        try
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(id);
            if (order == null)
            {
                return NotFound(new { message = "Order not found" });
            }

            if (!Enum.IsDefined(typeof(OrderStatus), request.Status))
            {
                return BadRequest(new { message = "Invalid order status" });
            }

            order.Status = (OrderStatus)request.Status;
            order.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.Orders.UpdateAsync(order);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Order {OrderId} status updated to {Status} by admin", 
                id, order.Status);

            return Ok(new
            {
                id = order.Id.ToString(),
                status = (int)order.Status,
                statusName = order.Status.ToString(),
                updatedAt = order.UpdatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating order status for order {OrderId}", id);
            return StatusCode(500, new { message = "An error occurred while updating order status" });
        }
    }

    [HttpGet("analytics/overview")]
    public async Task<ActionResult> GetAnalyticsOverview()
    {
        try
        {
            var orders = await _unitOfWork.Orders.GetAllAsync();
            var products = await _unitOfWork.Products.GetAllAsync();

            // Calculate monthly revenue (last 12 months)
            var monthlyRevenue = orders
                .Where(o => o.CreatedAt >= DateTime.UtcNow.AddMonths(-12))
                .GroupBy(o => new { o.CreatedAt.Year, o.CreatedAt.Month })
                .Select(g => new
                {
                    month = $"{g.Key.Year}-{g.Key.Month:D2}",
                    revenue = g.Sum(o => o.TotalAmount),
                    orderCount = g.Count()
                })
                .OrderBy(x => x.month)
                .ToList();

            // Order status distribution
            var statusDistribution = orders
                .GroupBy(o => o.Status)
                .Select(g => new
                {
                    status = g.Key.ToString(),
                    count = g.Count(),
                    percentage = Math.Round((double)g.Count() / orders.Count() * 100, 2)
                })
                .ToList();

            return Ok(new
            {
                monthlyRevenue,
                statusDistribution,
                totalActiveProducts = products.Count(p => p.IsActive),
                totalInactiveProducts = products.Count(p => !p.IsActive)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving analytics overview");
            return StatusCode(500, new { message = "An error occurred while retrieving analytics" });
        }
    }

    [HttpGet("users")]
    public async Task<ActionResult> GetAllUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            var users = await _userManager.Users
                .OrderBy(u => u.Email)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var totalUsers = await _userManager.Users.CountAsync();

            var userList = new List<object>();
            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userList.Add(new
                {
                    id = user.Id.ToString(),
                    email = user.Email,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    roles = roles.ToList(),
                    emailConfirmed = user.EmailConfirmed,
                    lockoutEnd = user.LockoutEnd,
                    createdAt = user.CreatedAt
                });
            }

            return Ok(new
            {
                users = userList,
                totalUsers,
                currentPage = page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)totalUsers / pageSize)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users");
            return StatusCode(500, new { message = "An error occurred while retrieving users" });
        }
    }

    [HttpGet("roles")]
    public async Task<ActionResult> GetAllRoles()
    {
        try
        {
            var roles = await _roleManager.Roles
                .Select(r => new { id = r.Id.ToString(), name = r.Name })
                .ToListAsync();

            return Ok(roles);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving roles");
            return StatusCode(500, new { message = "An error occurred while retrieving roles" });
        }
    }

    [HttpPost("users/{userId}/roles")]
    public async Task<ActionResult> AssignRole(string userId, [FromBody] AssignRoleRequest request)
    {
        try
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return BadRequest(new { message = "Invalid user ID" });
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var roleExists = await _roleManager.RoleExistsAsync(request.RoleName);
            if (!roleExists)
            {
                return BadRequest(new { message = "Role does not exist" });
            }

            var isInRole = await _userManager.IsInRoleAsync(user, request.RoleName);
            if (isInRole)
            {
                return BadRequest(new { message = "User already has this role" });
            }

            var result = await _userManager.AddToRoleAsync(user, request.RoleName);
            if (!result.Succeeded)
            {
                return BadRequest(new { message = "Failed to assign role", errors = result.Errors.Select(e => e.Description) });
            }

            _logger.LogInformation("Role {RoleName} assigned to user {UserId} by admin", request.RoleName, userId);

            return Ok(new { message = "Role assigned successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning role to user {UserId}", userId);
            return StatusCode(500, new { message = "An error occurred while assigning role" });
        }
    }

    [HttpDelete("users/{userId}/roles/{roleName}")]
    public async Task<ActionResult> RemoveRole(string userId, string roleName)
    {
        try
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return BadRequest(new { message = "Invalid user ID" });
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var isInRole = await _userManager.IsInRoleAsync(user, roleName);
            if (!isInRole)
            {
                return BadRequest(new { message = "User does not have this role" });
            }

            // Prevent removing the last admin role
            if (roleName.Equals("Admin", StringComparison.OrdinalIgnoreCase))
            {
                var admins = await _userManager.GetUsersInRoleAsync("Admin");
                if (admins.Count <= 1)
                {
                    return BadRequest(new { message = "Cannot remove the last admin user" });
                }
            }

            var result = await _userManager.RemoveFromRoleAsync(user, roleName);
            if (!result.Succeeded)
            {
                return BadRequest(new { message = "Failed to remove role", errors = result.Errors.Select(e => e.Description) });
            }

            _logger.LogInformation("Role {RoleName} removed from user {UserId} by admin", roleName, userId);

            return Ok(new { message = "Role removed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing role from user {UserId}", userId);
            return StatusCode(500, new { message = "An error occurred while removing role" });
        }
    }

    [HttpPost("users/{userId}/lock")]
    public async Task<ActionResult> LockUser(string userId, [FromBody] LockUserRequest request)
    {
        try
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return BadRequest(new { message = "Invalid user ID" });
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Prevent locking admin users
            var isAdmin = await _userManager.IsInRoleAsync(user, "Admin");
            if (isAdmin)
            {
                return BadRequest(new { message = "Cannot lock admin users" });
            }

            var lockoutEnd = request.LockoutMinutes > 0 
                ? DateTimeOffset.UtcNow.AddMinutes(request.LockoutMinutes)
                : DateTimeOffset.MaxValue; // Permanent lock

            var result = await _userManager.SetLockoutEndDateAsync(user, lockoutEnd);
            if (!result.Succeeded)
            {
                return BadRequest(new { message = "Failed to lock user", errors = result.Errors.Select(e => e.Description) });
            }

            _logger.LogInformation("User {UserId} locked until {LockoutEnd} by admin", userId, lockoutEnd);

            return Ok(new { message = "User locked successfully", lockoutEnd });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error locking user {UserId}", userId);
            return StatusCode(500, new { message = "An error occurred while locking user" });
        }
    }

    [HttpPost("users/{userId}/unlock")]
    public async Task<ActionResult> UnlockUser(string userId)
    {
        try
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return BadRequest(new { message = "Invalid user ID" });
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var result = await _userManager.SetLockoutEndDateAsync(user, null);
            if (!result.Succeeded)
            {
                return BadRequest(new { message = "Failed to unlock user", errors = result.Errors.Select(e => e.Description) });
            }

            _logger.LogInformation("User {UserId} unlocked by admin", userId);

            return Ok(new { message = "User unlocked successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unlocking user {UserId}", userId);
            return StatusCode(500, new { message = "An error occurred while unlocking user" });
        }
    }

    // Store Management Endpoints
    [HttpGet("stores/pending")]
    public async Task<ActionResult> GetPendingStoreApprovals()
    {
        try
        {
            _logger.LogInformation("Getting pending store approvals for admin");
            var stores = await _storeService.GetPendingApprovalsAsync();
            return Ok(stores);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving pending store approvals");
            return StatusCode(500, new { message = "An error occurred while retrieving pending store approvals" });
        }
    }

    [HttpGet("stores")]
    public async Task<ActionResult> GetAllStores([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        try
        {
            _logger.LogInformation("Getting all stores for admin");
            var stores = await _storeService.GetAllAsync();
            
            var totalStores = stores.Count();
            var pagedStores = stores
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return Ok(new
            {
                stores = pagedStores,
                totalStores,
                currentPage = page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)totalStores / pageSize)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all stores");
            return StatusCode(500, new { message = "An error occurred while retrieving stores" });
        }
    }

    [HttpPost("stores/{storeId}/approve")]
    public async Task<ActionResult> ApproveStore(Guid storeId)
    {
        try
        {
            _logger.LogInformation("Approving store {StoreId}", storeId);
            
            var approvalDto = new Application.DTOs.StoreApprovalDto
            {
                IsApproved = true,
                RejectionReason = null
            };
            
            var success = await _storeService.ApproveStoreAsync(storeId, approvalDto);
            
            if (!success)
                return NotFound(new { message = "Store not found" });

            return Ok(new { message = "Store approved successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving store {StoreId}", storeId);
            return StatusCode(500, new { message = "An error occurred while approving store" });
        }
    }

    [HttpPost("stores/{storeId}/reject")]
    public async Task<ActionResult> RejectStore(Guid storeId, [FromBody] RejectStoreRequest request)
    {
        try
        {
            _logger.LogInformation("Rejecting store {StoreId} with reason: {Reason}", storeId, request.Reason);
            
            var approvalDto = new Application.DTOs.StoreApprovalDto
            {
                IsApproved = false,
                RejectionReason = request.Reason
            };
            
            var success = await _storeService.ApproveStoreAsync(storeId, approvalDto);
            
            if (!success)
                return NotFound(new { message = "Store not found" });

            return Ok(new { message = "Store rejected successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting store {StoreId}", storeId);
            return StatusCode(500, new { message = "An error occurred while rejecting store" });
        }
    }

    [HttpPost("stores/{storeId}/suspend")]
    public async Task<ActionResult> SuspendStore(Guid storeId, [FromBody] SuspendStoreRequest request)
    {
        try
        {
            _logger.LogInformation("Suspending store {StoreId} with reason: {Reason}", storeId, request.Reason);
            
            var success = await _storeService.SuspendStoreAsync(storeId, request.Reason);
            
            if (!success)
                return NotFound(new { message = "Store not found" });

            return Ok(new { message = "Store suspended successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error suspending store {StoreId}", storeId);
            return StatusCode(500, new { message = "An error occurred while suspending store" });
        }
    }

    [HttpPost("stores/{storeId}/activate")]
    public async Task<ActionResult> ActivateStore(Guid storeId)
    {
        try
        {
            _logger.LogInformation("Activating store {StoreId}", storeId);
            
            var success = await _storeService.ReactivateStoreAsync(storeId);
            
            if (!success)
                return NotFound(new { message = "Store not found" });

            return Ok(new { message = "Store activated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating store {StoreId}", storeId);
            return StatusCode(500, new { message = "An error occurred while activating store" });
        }
    }
}

public class UpdateOrderStatusRequest
{
    public int Status { get; set; }
}

public class AssignRoleRequest
{
    public string RoleName { get; set; } = string.Empty;
}

public class LockUserRequest
{
    public int LockoutMinutes { get; set; } = 0; // 0 = permanent lock
}

public class RejectStoreRequest
{
    public string Reason { get; set; } = string.Empty;
}

public class SuspendStoreRequest
{
    public string Reason { get; set; } = string.Empty;
}