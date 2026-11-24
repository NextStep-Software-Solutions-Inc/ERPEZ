using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APP.Commands.CreateAPP;

public record CreateAPPCommand : IRequest<ApiResponse<Guid>>
{
    public string APPNumber { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public Guid FiscalYearId { get; init; }
    /// <summary>
    /// Must be "Indicative" or "Final". "Updated" APPs are created exclusively
    /// via the CloneUpdatedAPP workflow from an approved Final or Updated APP.
    /// </summary>
    public string APPType { get; init; } = "Indicative";
    public string Batch { get; init; } = "Batch 1";
    public string Quarter { get; init; } = "Q1";
    public string? Remarks { get; init; }
    public string? Description { get; init; }
}
