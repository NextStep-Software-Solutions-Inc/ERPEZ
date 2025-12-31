namespace ERPEZ.Shared.Interfaces;

/// <summary>
/// Interface for entities that support audit tracking (CreatedAt, CreatedBy, UpdatedAt, UpdatedBy).
/// </summary>
public interface IAuditableEntity
{
    DateTime CreatedAt { get; set; }
    string CreatedBy { get; set; }
    DateTime? UpdatedAt { get; set; }
    string? UpdatedBy { get; set; }
}
