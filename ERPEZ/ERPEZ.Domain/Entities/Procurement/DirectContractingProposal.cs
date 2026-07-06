using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

public class DirectContractingProposal : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid DirectContractingId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid SupplierId { get; set; }

    public string ExclusivityDocumentUrl { get; set; } = string.Empty;

    public string? ProposalRemarks { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal TotalProposalAmount { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime SubmittedAt { get; set; }

    // Navigation properties
    public virtual DirectContracting DirectContracting { get; set; } = null!;
    public virtual Supplier Supplier { get; set; } = null!;
    public virtual List<DirectContractingProposalItem> ProposalItems { get; set; } = [];
}
