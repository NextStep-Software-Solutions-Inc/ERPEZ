using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRRating.Queries.GetOPCRRatingById;

public class GetOPCRRatingByIdQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetOPCRRatingByIdQuery, ApiResponse<Domain.Entities.Planning.OPCRRating>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.OPCRRating>> Handle(GetOPCRRatingByIdQuery request, CancellationToken cancellationToken)
    {
        var opcrRating = await _unitOfWork.OPCRRatingRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.OPCRRating>.Success(opcrRating, "Retrieved successfully");
    }
}
