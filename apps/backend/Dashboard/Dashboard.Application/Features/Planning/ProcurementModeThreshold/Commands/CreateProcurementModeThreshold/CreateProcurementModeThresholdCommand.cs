using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementModeThreshold.Commands.CreateProcurementModeThreshold;

public record CreateProcurementModeThresholdCommand : IRequest<ApiResponse<Guid>>
{
    public Guid ProcurementModeId { get; init; }
    public decimal MinThreshold { get; init; }
    public decimal? MaxThreshold { get; init; }
    public DateTime EffectivityStart { get; init; }
    public DateTime? EffectivityEnd { get; init; }
}
