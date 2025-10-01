namespace ERPEZ.Domain.Common;

public interface IEntity
{
    Guid Id { get; }
    DateTime CreatedAt { get; }
    string CreatedBy { get; }
    DateTime UpdatedAt { get; }
    Guid? UpdatedBy { get; }
    bool IsDeleted { get; }
    DateTime DeletedAt { get; }
    Guid? DeletedBy { get; }
}