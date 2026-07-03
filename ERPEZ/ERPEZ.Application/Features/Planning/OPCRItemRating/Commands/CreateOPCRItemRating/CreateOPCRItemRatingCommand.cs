using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItemRating.Commands.CreateOPCRItemRating;

public record CreateOPCRItemRatingCommand : IRequest<ApiResponse<Guid>>
{
    public Guid OPCRItemId { get; init; }
    public Guid FYActiveKPIMeasurementId  { get; init; }
    public DimensionEnum Dimension { get; init; }
    public decimal? SelfRating { get; init; }
}