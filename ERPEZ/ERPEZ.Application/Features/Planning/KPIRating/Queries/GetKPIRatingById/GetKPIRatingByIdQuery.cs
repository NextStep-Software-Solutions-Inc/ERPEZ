using ERPEZ.Application.Features.Planning.KPIRating.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIRating.Queries.GetKPIRatingById;

public record GetKPIRatingByIdQuery(Guid Id) : IRequest<ApiResponse<KPIRatingResponse>>;
