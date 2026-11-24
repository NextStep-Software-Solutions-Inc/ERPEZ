using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FYActiveKPIMeasurement.Commands.UpdateFYActiveKPIMeasurement;

public record UpdateFYActiveKPIMeasurementCommand : IRequest<ApiResponse<Unit>>
{
    public required Guid Id { get; init; }
    public required UpdateFYActiveKPIMeasurementRequest UpdateFYActiveKPIMeasurement { get; init; }
}

public record UpdateFYActiveKPIMeasurementRequest
{
    public List<DimensionEnum>? Dimensions { get; init; }
    public List<string>? MOVs { get; init; }
    public Guid? RatingScaleTemplateId { get; init; }
    public bool? IsMOVEditable { get; init; }
    public bool? IsScaleEditable { get; init; }
}
