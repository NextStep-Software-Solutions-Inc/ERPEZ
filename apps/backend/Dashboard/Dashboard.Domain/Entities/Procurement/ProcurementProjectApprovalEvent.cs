using ERPEZ.Domain.Common;
using Sieve.Attributes;
using System;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Audit trail for ProcurementProject / BAC Resolution approval workflow.
/// Records each action (Submit, Approve, Return, etc.) with actor details, notes/remarks, attachment, and timestamp.
/// </summary>
public class ProcurementProjectApprovalEvent : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ProcurementProjectId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Action { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ActorId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? ActorName { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Role { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Remarks { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? AttachmentFileId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    // Navigation property
    public virtual ProcurementProject ProcurementProject { get; set; } = null!;
}
