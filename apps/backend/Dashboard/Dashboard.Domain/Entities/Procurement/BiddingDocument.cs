using System.ComponentModel.DataAnnotations.Schema;
using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Represents the Philippine Bidding Document (PBD) for a procurement project.
/// Lean scaffold for now — only carries what the Supplier Portal needs as a public
/// visibility gate (Status == Posted). Category-specific structured fields (Phase 0A)
/// will be added in a dedicated TC-02 task once that scope starts.
/// </summary>
[Table("BiddingDocument", Schema = "procurement")]
public class BiddingDocument : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ProcurementProjectId { get; set; }

    /// <summary>
    /// Snapshot of ProcurementProject.ProcurementMode.ProcurementCategoryId at PBD creation time.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ProcurementCategoryId { get; set; }

    /// <summary>Draft | Generated | Posted</summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string Status { get; set; } = "Draft";

    public DateTime? PostedAt       { get; set; }
    public Guid?     PostedByUserId { get; set; }

    // Navigation properties
    public virtual ProcurementProject  ProcurementProject  { get; set; } = null!;
    public virtual ProcurementCategory ProcurementCategory { get; set; } = null!;
}