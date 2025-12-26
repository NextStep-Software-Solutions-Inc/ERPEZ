using ERPEZ.Application.Features.Planning.Rating.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Rating.Commands.UpdateRating;

public class UpdateRatingCommand : IRequest<ApiResponse<RatingResponse>>
{
    public Guid Id { get; set; }
    public required UpdateRatingRequest UpdateRating { get; set; }
}
