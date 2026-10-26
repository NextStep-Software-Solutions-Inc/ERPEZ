using System;
using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Represents a contract execution milestone logged against an issued Notice of Award.
/// </summary>
public class NoticeOfAwardMilestone : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid NoticeOfAwardId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public NoticeOfAwardMilestoneType MilestoneType { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly DateLogged { get; set; }

    public Guid? FileId { get; set; }
    public string? FileName { get; set; }

    public Guid? LoggedById { get; set; }
    public string? LoggedByName { get; set; }
    public string? Remarks { get; set; }

    // Navigation properties
    public virtual NoticeOfAward NoticeOfAward { get; set; } = null!;
}
