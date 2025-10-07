namespace ERPEZ.Domain.Common;

public abstract class BaseEntity : IEntity
{
    protected BaseEntity() { }
    public Guid Id { get; protected set; }
    public DateTime? CreatedAt { get; protected set; }
    public string CreatedBy { get; protected set; } = string.Empty;
    public DateTime? UpdatedAt { get; protected set; }
    public string? UpdatedBy { get; protected set; }
    public bool IsDeleted { get; protected set; }
    public DateTime? DeletedAt { get; protected set; }
    public string? DeletedBy { get; protected set; }
}