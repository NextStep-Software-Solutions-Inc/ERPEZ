using ERPEZ.Application.Features.Procurement.DirectContractings.Commands.ReviewDirectContractingProposal;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Dtos;

public record ReviewDirectContractingProposalRequest
{
    public ReviewAction Action { get; init; }
    public string? Remarks { get; init; }
}
