// UpdateOPCRItemMOVCommand.cs
using ERPEZ.Application.Features.Planning.OPCRItemMOV.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItemMOV.Commands.UpdateOPCRItemMOV;

public record UpdateOPCRItemMOVCommand : IRequest<ApiResponse<Unit>>
{
    public Guid                   Id      { get; init; }
    public UpdateOPCRItemMOVRequest Request { get; init; } = null!;
}