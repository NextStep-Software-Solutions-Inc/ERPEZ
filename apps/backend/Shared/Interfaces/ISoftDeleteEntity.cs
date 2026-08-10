namespace ERPEZ.Shared.Interfaces;

/// <summary>
/// Interface for entities that support soft delete functionality (IsDeleted, DeletedAt, DeletedBy).
/// </summary>
public interface ISoftDeleteEntity : IAuditableEntity
{
    bool IsDeleted { get; set; }
    DateTime? DeletedAt { get; set; }
    string? DeletedBy { get; set; }
    bool AllowHardDelete { get; set; }
}
