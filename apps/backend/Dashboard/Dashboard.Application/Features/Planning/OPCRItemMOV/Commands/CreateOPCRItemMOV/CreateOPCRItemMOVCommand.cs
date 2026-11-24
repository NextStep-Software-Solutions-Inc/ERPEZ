using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItemMOV.Commands.CreateOPCRItemMOV;

public record CreateOPCRItemMOVCommand : IRequest<ApiResponse<Guid>>
{
    public Guid OPCRItemId { get; init; }
    public Guid FYActiveKPIMeasurementId { get; init; }
    public Guid FileId { get; init; }    
    public string RequirementName { get; init; } = string.Empty;
}