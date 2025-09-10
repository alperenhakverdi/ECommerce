using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces;

public interface IStoreService
{
    // Store CRUD operations
    Task<StoreResponseDto> CreateAsync(Guid userId, CreateStoreDto createStoreDto);
    Task<StoreResponseDto?> GetByIdAsync(Guid storeId);
    Task<IEnumerable<StoreListDto>> GetAllAsync();
    Task<IEnumerable<StoreListDto>> GetByOwnerAsync(Guid ownerId);
    Task<StoreResponseDto?> UpdateAsync(Guid storeId, Guid userId, UpdateStoreDto updateStoreDto);
    Task<bool> DeleteAsync(Guid storeId, Guid userId);

    // Store approval and management (Admin only)
    Task<bool> ApproveStoreAsync(Guid storeId, StoreApprovalDto approvalDto);
    Task<bool> SuspendStoreAsync(Guid storeId, string suspensionReason);
    Task<bool> ReactivateStoreAsync(Guid storeId);
    Task<bool> RejectStoreAsync(Guid storeId, string rejectionReason);
    Task<IEnumerable<StoreListDto>> GetPendingApprovalsAsync();
    Task<IEnumerable<StoreListDto>> GetSuspendedStoresAsync();

    // Store statistics and metrics
    Task<StoreStatsDto?> GetStoreStatsAsync(Guid storeId);
    Task<bool> UpdateStoreMetricsAsync(Guid storeId);

    // Store search and filtering
    Task<IEnumerable<StoreListDto>> SearchStoresAsync(string searchTerm);
    Task<IEnumerable<StoreListDto>> GetActiveStoresAsync();
    Task<IEnumerable<StoreListDto>> GetTopRatedStoresAsync(int count = 10);

    // Store ownership verification
    Task<bool> IsStoreOwnerAsync(Guid storeId, Guid userId);
    Task<bool> CanUserManageStoreAsync(Guid storeId, Guid userId);

    // Store products (related operations)
    Task<int> GetProductCountAsync(Guid storeId);
    Task<bool> HasActiveProductsAsync(Guid storeId);
    Task<IEnumerable<ProductDto>> GetProductsAsync(Guid storeId, int page = 1, int pageSize = 50);
    Task<ProductDto> CreateProductAsync(Guid storeId, CreateProductDto createProductDto);
}