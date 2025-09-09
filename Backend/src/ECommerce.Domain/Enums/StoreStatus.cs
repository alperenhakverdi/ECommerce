namespace ECommerce.Domain.Enums;

public enum StoreStatus
{
    Pending = 0,        // Awaiting admin approval
    Active = 1,         // Approved and active
    Suspended = 2,      // Temporarily suspended by admin
    Rejected = 3,       // Rejected by admin
    Inactive = 4        // Deactivated by store owner
}