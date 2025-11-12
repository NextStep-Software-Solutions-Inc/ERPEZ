using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIRating.Queries.GetKPIRatingById;

public class GetKPIRatingByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetKPIRatingByIdQuery, ApiResponse<Domain.Entities.Planning.KPIRating>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.KPIRating>> Handle(GetKPIRatingByIdQuery request, CancellationToken cancellationToken)
    {
        var kPIRating = await unitOfWork.KPIRatingRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.KPIRating>.Success(kPIRating, "Retrieved successfully");
    }
}
