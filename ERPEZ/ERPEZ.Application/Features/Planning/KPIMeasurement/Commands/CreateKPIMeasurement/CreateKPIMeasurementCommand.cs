using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIMeasurement.Commands.CreateKPIMeasurement;

public record CreateKPIMeasurementCommand : IRequest<ApiResponse<Guid>>
{
    public Guid KPIId { get; init; }
    public string Dimension { get; init; } = string.Empty; // Quantity, Quality, Timeliness
    public Guid? RatingScaleTemplateId { get; init; }
    public List<string> MOVs { get; init; } = [];
    public bool IsMOVEditable { get; init; } = true;
    public bool IsScaleEditable { get; init; } = true;
}
