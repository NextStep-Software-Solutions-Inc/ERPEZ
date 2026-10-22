// UpdateOPCRConsolidationNameCommand.cs
using ERPEZ.Application.Features.Planning.OPCRConsolidation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRConsolidation.Commands.UpdateOPCRConsolidation;

public record UpdateOPCRConsolidationNameCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public required UpdateOPCRConsolidationNameRequest Request { get; init; }
}