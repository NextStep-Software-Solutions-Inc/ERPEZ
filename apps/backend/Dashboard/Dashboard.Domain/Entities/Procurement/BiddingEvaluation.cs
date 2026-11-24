using System;
using System.Collections.Generic;
using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Aggregate root representing the BAC / TWG Bid Evaluation for a Public Bidding project.
/// Exactly one authoritative BiddingEvaluation exists per ProcurementProject.
/// </summary>
public class BiddingEvaluation : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ProcurementProjectId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string AwardCriterion { get; set; } = "LCRB"; // "LCRB" | "MEARB"

    public decimal? TechnicalWeight { get; set; } // Derived from project approved criteria (e.g. 70.00)
    public decimal? FinancialWeight { get; set; } // Derived from project approved criteria (e.g. 30.00)

    [Sieve(CanFilter = true, CanSort = true)]
    public string Status { get; set; } = "Draft"; // "Draft" | "Completed"

    // Audit identity conventions
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? EvaluatedById { get; set; }
    public string? EvaluatedByName { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? EvaluatedAt { get; set; }

    public string? Remarks { get; set; }

    // Navigation properties
    public virtual ProcurementProject ProcurementProject { get; set; } = null!;
    public virtual List<BiddingEvaluatedBid> EvaluatedBids { get; set; } = [];
}
