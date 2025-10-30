using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIRating.Queries.GetKPIRatingById;

public record class GetKPIRatingByIdQuery(Guid Id) : IRequest<ApiResponse<Domain.Entities.Planning.KPIRating>>;