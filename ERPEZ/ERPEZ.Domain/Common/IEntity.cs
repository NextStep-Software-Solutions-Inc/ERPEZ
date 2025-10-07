namespace ERPEZ.Domain.Common;

public interface IEntity
{
    Guid Id { get; }
    DateTime? CreatedAt { get; }
    string CreatedBy { get; }
    DateTime? UpdatedAt { get; }
    string? UpdatedBy { get; }
    bool IsDeleted { get; }
    DateTime? DeletedAt { get; }
    string? DeletedBy { get; }
}