using ERPEZ.Shared.Common;
using MediatR;
using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.ConsolidatePPMPs;

public record ConsolidatePPMPsCommand : IRequest<ApiResponse<Guid>>
{
    [JsonPropertyName("ChildPPMPIds")]
    public List<Guid> ChildPPMPIds { get; init; } = [];
    public Guid ParentOfficeId { get; init; }
    public Guid FiscalYearId { get; init; }
    public string ConsolidatedPPMPNumber { get; init; } = string.Empty;
}
