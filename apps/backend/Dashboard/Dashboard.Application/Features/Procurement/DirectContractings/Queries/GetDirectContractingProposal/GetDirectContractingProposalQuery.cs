using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Queries.GetDirectContractingProposal;

public record GetDirectContractingProposalQuery(Guid DirectContractingId) : IRequest<ApiResponse<Dtos.DirectContractingProposalResponse>>
{
}
