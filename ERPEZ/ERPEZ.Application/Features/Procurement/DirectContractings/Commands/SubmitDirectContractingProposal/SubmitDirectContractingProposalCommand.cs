using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.SubmitDirectContractingProposal;

public record SubmitDirectContractingProposalCommand : IRequest<ApiResponse<Guid>>
{
    public Guid DirectContractingId { get; init; }
    public required SubmitDirectContractingProposalRequest Request { get; init; }
}
