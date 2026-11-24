using ERPEZ.Application.Features.Planning.OPCRConsolidation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRConsolidation.Commands.CreateOPCRConsolidation;

public record CreateOPCRConsolidationCommand : IRequest<ApiResponse<Guid>>
{
    public required CreateOPCRConsolidationRequest Request { get; init; }
}