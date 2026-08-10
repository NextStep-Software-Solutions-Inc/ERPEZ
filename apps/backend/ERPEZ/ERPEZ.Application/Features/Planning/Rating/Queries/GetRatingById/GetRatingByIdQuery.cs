using ERPEZ.Application.Features.Planning.Rating.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Rating.Queries.GetRatingById;

public record GetRatingByIdQuery(Guid Id) : IRequest<ApiResponse<RatingResponse>>;
