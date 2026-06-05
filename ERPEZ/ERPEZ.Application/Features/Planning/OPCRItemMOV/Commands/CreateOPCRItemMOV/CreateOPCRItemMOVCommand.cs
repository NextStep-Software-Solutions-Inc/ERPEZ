using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItemMOV.Commands.CreateOPCRItemMOV;

public record CreateOPCRItemMOVCommand : IRequest<ApiResponse<Guid>>
{
    public Guid OPCRItemId { get; init; }
    public string RequirementName { get; init; } = string.Empty;
    public string? AttachedUrl { get; init; }
    public DateTime? UploadedDate { get; init; }
}