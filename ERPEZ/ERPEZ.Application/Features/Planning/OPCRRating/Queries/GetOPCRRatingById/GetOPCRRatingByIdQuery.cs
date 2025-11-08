using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRRating.Queries.GetOPCRRatingById;

public record class GetOPCRRatingByIdQuery(Guid Id) : IRequest<ApiResponse<Domain.Entities.Planning.OPCRRating>>;
