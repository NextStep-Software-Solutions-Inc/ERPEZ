using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;
using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Consolidated Purchase Request (CPR) — Procurement Office workspace.
///
/// Created by the Procurement Office (Image 10: "Create Consolidated PR" modal).
/// Aggregates multiple approved Office/Agency PRs into a single package
/// for BAC utilization (Image 9 status: "APPROVED/FOR BAC UTILIZATION").
///
/// Visibility rule (Image 10): remains Draft and visible only to the
/// Procurement Office until published/submitted.
/// </summary>
public class ConsolidatedPR : ApprovableEntity
{
    public ConsolidatedPR() { }

    // ── Identity ─────────────────────────────────────────────────────────────

    /// <summary>Human-readable ID (e.g. CPR-001, CPR-002) shown in the datatable.</summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string CPRNumber { get; set; } = string.Empty;

    /// <summary>Brief summary shown in Description column (e.g. "Consolidation for March 2026").</summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }

    /// <summary>Optional scope/purpose from the Create modal (Image 10).</summary>
    public string? Purpose { get; set; }

    /// <summary>Date auto-populated from today in the Create modal (Image 10).</summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly ConsolidationDate { get; set; }

    /// <summary>Aggregate total of all included PRs. Shown in the "Total Amount" summary card.</summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal TotalAmount { get; set; }

    // ── Navigation ────────────────────────────────────────────────────────────

    public virtual List<ConsolidatedPRItem> ConsolidatedPRItems { get; set; } = [];
    public virtual List<ApprovalEvent> ApprovalEvents { get; set; } = [];
}