using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIMeasurement.Commands.UpdateKPIMeasurement;

public record UpdateKPIMeasurementCommand : IRequest<ApiResponse<Unit>>
{
    public required Guid Id { get; init; }
    public required UpdateKPIMeasurementRequest UpdateKPIMeasurement { get; init; }
}

public record UpdateKPIMeasurementRequest
{
    public List<string>? MOVs { get; init; }
    public Guid? RatingScaleTemplateId { get; init; }
    public bool? IsMOVEditable { get; init; }
    public bool? IsScaleEditable { get; init; }
}
