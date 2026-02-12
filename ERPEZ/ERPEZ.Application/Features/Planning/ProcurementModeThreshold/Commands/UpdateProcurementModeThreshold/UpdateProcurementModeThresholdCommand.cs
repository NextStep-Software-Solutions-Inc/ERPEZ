using ERPEZ.Shared.Common;
using MediatR;
using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.ProcurementModeThreshold.Commands.UpdateProcurementModeThreshold;

public record UpdateProcurementModeThresholdCommand : IRequest<ApiResponse<Unit>>
{
    [JsonIgnore]
    public Guid Id { get; init; }
    public decimal? MinThreshold { get; init; }
    public decimal? MaxThreshold { get; init; }
    public DateTime? EffectivityStart { get; init; }
    public DateTime? EffectivityEnd { get; init; }
}
