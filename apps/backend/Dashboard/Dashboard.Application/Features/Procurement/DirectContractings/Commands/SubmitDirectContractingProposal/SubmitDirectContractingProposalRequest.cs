using System;
using System.Collections.Generic;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.SubmitDirectContractingProposal;

public record SubmitDirectContractingProposalRequest
{
    public Guid SupplierId { get; init; }
    public string ExclusivityDocumentUrl { get; init; } = string.Empty;
    public string? ExclusivityProofUrl { get; init; }
    public string? ProposalRemarks { get; init; }
    public string? ProposalNotes { get; init; }
    public List<SubmitProposalItemRequest> ProposalItems { get; init; } = [];
    public List<SubmitProposalItemRequest>? QuotationItems { get; init; }
}

public record SubmitProposalItemRequest
{
    public Guid CPRItemId { get; init; }
    public Guid? PrItemId { get; init; }
    public decimal UnitBid { get; init; }
    public decimal? BidUnitPrice { get; init; }
    public string? Brand { get; init; }
    public string? BidBrand { get; init; }
    public string? Model { get; init; }
    public string? BidModel { get; init; }
    public string? Color { get; init; }
    public string? BidColor { get; init; }
    public string? BrochureFileUrl { get; init; }
    public string? BidBrochureUrl { get; init; }
}
