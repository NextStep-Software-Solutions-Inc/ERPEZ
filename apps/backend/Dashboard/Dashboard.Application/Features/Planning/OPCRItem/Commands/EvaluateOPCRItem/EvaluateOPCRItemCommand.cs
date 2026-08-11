// EvaluateOPCRItemCommand.cs
using ERPEZ.Application.Features.Planning.OPCRItem.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItem.Commands.EvaluateOPCRItem;

public record EvaluateOPCRItemCommand : IRequest<ApiResponse<Unit>>
{
    public Guid                   OPCRItemId { get; init; }
    public EvaluateOPCRItemRequest Request   { get; init; } = null!;
}