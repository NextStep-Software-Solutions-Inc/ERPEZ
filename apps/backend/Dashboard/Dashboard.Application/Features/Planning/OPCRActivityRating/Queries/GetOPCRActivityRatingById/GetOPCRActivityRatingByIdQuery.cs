using ERPEZ.Application.Features.Planning.OPCRActivityRating.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityRating.Queries.GetOPCRActivityRatingById;

public record GetOPCRActivityRatingByIdQuery(Guid Id) : IRequest<ApiResponse<OPCRActivityRatingDetailedResponse>>;
