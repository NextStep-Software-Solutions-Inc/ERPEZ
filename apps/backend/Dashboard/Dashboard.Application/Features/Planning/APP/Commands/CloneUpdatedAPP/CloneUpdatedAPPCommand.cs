using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APP.Commands.CloneUpdatedAPP;

public record CloneUpdatedAPPCommand : IRequest<ApiResponse<Guid>>
{
    public Guid SourceAppId { get; init; }
    public string APPNumber { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Batch { get; init; } = "Batch 1";
    public string Quarter { get; init; } = "Q1";
    public string? Remarks { get; init; }
    public string? Description { get; init; }
}
