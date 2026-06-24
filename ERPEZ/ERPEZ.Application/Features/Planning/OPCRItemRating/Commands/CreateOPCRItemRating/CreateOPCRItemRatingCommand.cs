using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItemRating.Commands.CreateOPCRItemRating;

public record CreateOPCRItemRatingCommand : IRequest<ApiResponse<Guid>>
{
    public Guid OPCRItemId { get; init; }
    public Guid FYActiveKPIMeasurementId  { get; init; }
    public decimal? SelfRating { get; init; }
}