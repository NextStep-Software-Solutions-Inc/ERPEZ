using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIMeasurement.Commands.UpdateKPIMeasurement;

public record UpdateKPIMeasurementCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public List<string>? MOVs { get; init; }
    public Guid? RatingScaleTemplateId { get; init; }
    public bool? IsMOVEditable { get; init; }
    public bool? IsScaleEditable { get; init; }
}
