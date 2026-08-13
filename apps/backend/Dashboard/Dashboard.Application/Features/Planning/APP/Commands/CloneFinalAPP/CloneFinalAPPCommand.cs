using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APP.Commands.CloneFinalAPP;

/// <summary>
/// Creates a new independent Final APP by carrying forward all procurement data
/// (PPMP links and APP items) from an approved Indicative APP.
/// The resulting Final APP starts as Draft and is fully editable.
/// Changes to the Final APP do not affect the source Indicative APP.
/// </summary>
public record CloneFinalAPPCommand : IRequest<ApiResponse<Guid>>
{
    /// <summary>
    /// Id of the approved Indicative APP to carry forward from.
    /// Set automatically from the route by the controller.
    /// </summary>
    public Guid SourceAppId { get; init; }

    public string APPNumber { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Batch { get; init; } = "Batch 1";
    public string Quarter { get; init; } = "Q1";
    public string? Remarks { get; init; }
    public string? Description { get; init; }
}
