using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

public class DirectContractingProposalItem : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ProposalId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid CPRItemId { get; set; } // Map to PPMPItem as Consolidated PR Item

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal UnitBid { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal TotalBid { get; set; }

    public string? Brand { get; set; }

    public string? Model { get; set; }

    public string? Color { get; set; }

    public string? BrochureFileUrl { get; set; }

    // Navigation properties
    public virtual DirectContractingProposal Proposal { get; set; } = null!;
    public virtual PPMPItem CPRItem { get; set; } = null!;
}
