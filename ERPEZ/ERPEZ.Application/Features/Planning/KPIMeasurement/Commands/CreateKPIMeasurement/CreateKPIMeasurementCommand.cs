using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIMeasurement.Commands.CreateKPIMeasurement;

public record MeasurementInput
{
    public string Name { get; init; } = string.Empty;
    public string Statement { get; init; } = string.Empty;
    public List<string> Dimensions { get; init; } = [];
    public Guid? RatingScaleTemplateId { get; init; }
    public List<string> MOVs { get; init; } = [];
    public bool IsMOVEditable { get; init; } = true;
    public bool IsScaleEditable { get; init; } = true;
}
public record CreateKPIMeasurementCommand : IRequest<ApiResponse<List<Guid>>>
{
    public Guid KPIId { get; init; }
    public List<MeasurementInput> Measurements { get; init; } = [];
}
