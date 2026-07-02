using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.ReviewDirectContractingProposal;

public record ReviewDirectContractingProposalCommand : IRequest<ApiResponse<Unit>>
{
    public Guid DirectContractingId { get; init; }
    public required string Action { get; init; } // APPROVED or RETURNED
    public string? Remarks { get; init; }
}
