using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Approval Event - Audit trail for PPMP approval workflow
/// Tracks each approval action (submit, approve, reject, return) with actor details and notes
/// </summary>
public class ApprovalEvent : TenantScopedEntity
{
    public ApprovalEvent() { }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid PPMPId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string Role { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string Action { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ActorId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string ActorName { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Notes { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime Timestamp { get; set; }
    
    // Navigation properties
    public virtual PPMP PPMP { get; set; } = null!;
}
