using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StoresController : ControllerBase
{
    private readonly IStoreService _storeService;
    private readonly IEmailService _emailService;
    private readonly ILogger<StoresController> _logger;

    public StoresController(
        IStoreService storeService, 
        IEmailService emailService,
        ILogger<StoresController> logger)
    {
        _storeService = storeService;
        _emailService = emailService;
        _logger = logger;
    }

    // GET: api/stores
    [HttpGet]
    public async Task<ActionResult<IEnumerable<StoreListDto>>> GetStores()
    {
        try
        {
            _logger.LogInformation("Getting all active stores");
            var stores = await _storeService.GetActiveStoresAsync();
            return Ok(stores);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting stores");
            return StatusCode(500, "Internal server error");
        }
    }

    // GET: api/stores/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<StoreResponseDto>> GetStore(Guid id)
    {
        try
        {
            _logger.LogInformation("Getting store: {StoreId}", id);
            var store = await _storeService.GetByIdAsync(id);
            
            if (store == null)
                return NotFound("Store not found");

            return Ok(store);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting store: {StoreId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    // GET: api/stores/search?term={searchTerm}
    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<StoreListDto>>> SearchStores([FromQuery] string term)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(term))
                return BadRequest("Search term is required");

            _logger.LogInformation("Searching stores with term: {SearchTerm}", term);
            var stores = await _storeService.SearchStoresAsync(term);
            return Ok(stores);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while searching stores with term: {SearchTerm}", term);
            return StatusCode(500, "Internal server error");
        }
    }

    // GET: api/stores/top-rated?count={count}
    [HttpGet("top-rated")]
    public async Task<ActionResult<IEnumerable<StoreListDto>>> GetTopRatedStores([FromQuery] int count = 10)
    {
        try
        {
            _logger.LogInformation("Getting top {Count} rated stores", count);
            var stores = await _storeService.GetTopRatedStoresAsync(count);
            return Ok(stores);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting top rated stores");
            return StatusCode(500, "Internal server error");
        }
    }

    // GET: api/stores/my-stores
    [HttpGet("my-stores")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<StoreListDto>>> GetMyStores()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized("Invalid user token");

            _logger.LogInformation("Getting stores for owner: {OwnerId}", userId);
            var stores = await _storeService.GetByOwnerAsync(userId);
            return Ok(stores);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting stores for user: {UserId}", GetCurrentUserId());
            return StatusCode(500, "Internal server error");
        }
    }

    // GET: api/stores/{id}/stats
    [HttpGet("{id}/stats")]
    [Authorize]
    public async Task<ActionResult<StoreStatsDto>> GetStoreStats(Guid id)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized("Invalid user token");

            // Check if user can manage this store
            var canManage = await _storeService.CanUserManageStoreAsync(id, userId) || 
                           User.IsInRole(UserRoles.Admin);
            
            if (!canManage)
                return Forbid("You don't have permission to view this store's statistics");

            _logger.LogInformation("Getting store statistics: {StoreId}", id);
            var stats = await _storeService.GetStoreStatsAsync(id);
            
            if (stats == null)
                return NotFound("Store not found");

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting store stats: {StoreId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    // POST: api/stores/apply
    [HttpPost("apply")]
    [Authorize]
    public async Task<ActionResult<StoreResponseDto>> ApplyToBecomeStore([FromBody] CreateStoreDto createStoreDto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized("Invalid user token");

            _logger.LogInformation("Store application received from user: {UserId}", userId);
            var store = await _storeService.CreateAsync(userId, createStoreDto);
            
            return CreatedAtAction(nameof(GetStore), new { id = store.Id }, store);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while processing store application for user: {UserId}", GetCurrentUserId());
            return StatusCode(500, "Internal server error");
        }
    }

    // POST: api/stores
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<StoreResponseDto>> CreateStore([FromBody] CreateStoreDto createStoreDto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized("Invalid user token");

            _logger.LogInformation("Creating store for user: {UserId}", userId);
            var store = await _storeService.CreateAsync(userId, createStoreDto);
            
            return CreatedAtAction(nameof(GetStore), new { id = store.Id }, store);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while creating store for user: {UserId}", GetCurrentUserId());
            return StatusCode(500, "Internal server error");
        }
    }

    // PUT: api/stores/{id}
    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<StoreResponseDto>> UpdateStore(Guid id, [FromBody] UpdateStoreDto updateStoreDto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized("Invalid user token");

            _logger.LogInformation("Updating store: {StoreId} for user: {UserId}", id, userId);
            var store = await _storeService.UpdateAsync(id, userId, updateStoreDto);
            
            if (store == null)
                return NotFound("Store not found or you don't have permission to update it");

            return Ok(store);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating store: {StoreId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    // DELETE: api/stores/{id}
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<ActionResult> DeleteStore(Guid id)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized("Invalid user token");

            _logger.LogInformation("Deleting store: {StoreId} for user: {UserId}", id, userId);
            var success = await _storeService.DeleteAsync(id, userId);
            
            if (!success)
                return NotFound("Store not found or you don't have permission to delete it");

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting store: {StoreId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    // PUT: api/stores/{id}/metrics
    [HttpPut("{id}/metrics")]
    [Authorize]
    public async Task<ActionResult> UpdateStoreMetrics(Guid id)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized("Invalid user token");

            // Check if user can manage this store
            var canManage = await _storeService.CanUserManageStoreAsync(id, userId) || 
                           User.IsInRole(UserRoles.Admin);
            
            if (!canManage)
                return Forbid("You don't have permission to update this store's metrics");

            _logger.LogInformation("Updating store metrics: {StoreId}", id);
            var success = await _storeService.UpdateStoreMetricsAsync(id);
            
            if (!success)
                return NotFound("Store not found");

            return Ok(new { message = "Store metrics updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating store metrics: {StoreId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    // Admin-only endpoints

    // GET: api/stores/pending-approvals
    [HttpGet("pending-approvals")]
    [Authorize(Roles = UserRoles.Admin)]
    public async Task<ActionResult<IEnumerable<StoreListDto>>> GetPendingApprovals()
    {
        try
        {
            _logger.LogInformation("Getting stores pending approval");
            var stores = await _storeService.GetPendingApprovalsAsync();
            return Ok(stores);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting pending store approvals");
            return StatusCode(500, "Internal server error");
        }
    }

    // PUT: api/stores/{id}/approve
    [HttpPut("{id}/approve")]
    [Authorize(Roles = UserRoles.Admin)]
    public async Task<ActionResult> ApproveStore(Guid id, [FromBody] StoreApprovalDto approvalDto)
    {
        try
        {
            _logger.LogInformation("Processing store approval: {StoreId}, Approved: {IsApproved}", 
                id, approvalDto.IsApproved);
            
            // Get store details before approval for email notification
            var storeDetails = await _storeService.GetByIdAsync(id);
            if (storeDetails == null)
                return NotFound("Store not found");
            
            var success = await _storeService.ApproveStoreAsync(id, approvalDto);
            
            if (!success)
                return NotFound("Store approval failed");

            // Send email notification to store owner
            try
            {
                if (approvalDto.IsApproved)
                {
                    _logger.LogInformation("Sending approval email to store owner: {StoreId}", id);
                    await _emailService.SendStoreApprovalEmailAsync(
                        storeDetails.OwnerEmail, 
                        storeDetails.Name, 
                        storeDetails.OwnerName
                    );
                }
                else
                {
                    _logger.LogInformation("Sending rejection email to store owner: {StoreId}", id);
                    var rejectionReason = approvalDto.RejectionReason ?? "Belirtilmemiş sebep";
                    await _emailService.SendStoreRejectionEmailAsync(
                        storeDetails.OwnerEmail, 
                        storeDetails.Name, 
                        storeDetails.OwnerName,
                        rejectionReason
                    );
                }
            }
            catch (Exception emailEx)
            {
                _logger.LogError(emailEx, "Failed to send email notification for store approval: {StoreId}", id);
                // Don't fail the approval process if email fails
            }

            var action = approvalDto.IsApproved ? "approved" : "rejected";
            return Ok(new { message = $"Store {action} successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while processing store approval: {StoreId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    // GET: api/stores/all (Admin only - shows all stores including inactive)
    [HttpGet("all")]
    [Authorize(Roles = UserRoles.Admin)]
    public async Task<ActionResult<IEnumerable<StoreListDto>>> GetAllStores()
    {
        try
        {
            _logger.LogInformation("Getting all stores (admin view)");
            var stores = await _storeService.GetAllAsync();
            return Ok(stores);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting all stores");
            return StatusCode(500, "Internal server error");
        }
    }

    // PUT: api/stores/{id}/suspend
    [HttpPut("{id}/suspend")]
    [Authorize(Roles = UserRoles.Admin)]
    public async Task<ActionResult> SuspendStore(Guid id, [FromBody] StoreSuspensionDto suspensionDto)
    {
        try
        {
            _logger.LogInformation("Processing store suspension: {StoreId}, Reason: {Reason}", 
                id, suspensionDto.SuspensionReason);
            
            // Get store details before suspension for email notification
            var storeDetails = await _storeService.GetByIdAsync(id);
            if (storeDetails == null)
                return NotFound("Store not found");
            
            var success = await _storeService.SuspendStoreAsync(id, suspensionDto.SuspensionReason);
            
            if (!success)
                return NotFound("Store suspension failed");

            // Send email notification to store owner
            try
            {
                _logger.LogInformation("Sending suspension email to store owner: {StoreId}", id);
                await _emailService.SendStoreSuspensionEmailAsync(
                    storeDetails.OwnerEmail, 
                    storeDetails.Name, 
                    storeDetails.OwnerName,
                    suspensionDto.SuspensionReason
                );
            }
            catch (Exception emailEx)
            {
                _logger.LogError(emailEx, "Failed to send email notification for store suspension: {StoreId}", id);
                // Don't fail the suspension process if email fails
            }

            return Ok(new { message = "Store suspended successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while processing store suspension: {StoreId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    // PUT: api/stores/{id}/reactivate
    [HttpPut("{id}/reactivate")]
    [Authorize(Roles = UserRoles.Admin)]
    public async Task<ActionResult> ReactivateStore(Guid id)
    {
        try
        {
            _logger.LogInformation("Processing store reactivation: {StoreId}", id);
            
            var success = await _storeService.ReactivateStoreAsync(id);
            
            if (!success)
                return NotFound("Store not found");

            return Ok(new { message = "Store reactivated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while processing store reactivation: {StoreId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    // GET: api/stores/suspended-stores
    [HttpGet("suspended-stores")]
    [Authorize(Roles = UserRoles.Admin)]
    public async Task<ActionResult<IEnumerable<StoreListDto>>> GetSuspendedStores()
    {
        try
        {
            _logger.LogInformation("Getting suspended stores");
            var stores = await _storeService.GetSuspendedStoresAsync();
            return Ok(stores);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while getting suspended stores");
            return StatusCode(500, "Internal server error");
        }
    }


    // GET: api/stores/{id}/products
    [HttpGet("{id}/products")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetStoreProducts(Guid id, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized("Invalid user token");

            _logger.LogInformation("Getting products for store: {StoreId} by user: {UserId}", id, userId);
            
            // Verify user owns this store
            var store = await _storeService.GetByIdAsync(id);
            if (store == null)
                return NotFound("Store not found");
            
            if (store.OwnerId != userId)
                return Forbid("You don't have permission to view this store's products");

            var products = await _storeService.GetProductsAsync(id, page, pageSize);
            return Ok(products);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting store products: {StoreId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }
}