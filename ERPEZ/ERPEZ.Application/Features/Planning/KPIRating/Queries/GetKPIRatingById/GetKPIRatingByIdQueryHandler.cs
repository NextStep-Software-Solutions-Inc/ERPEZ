using ERPEZ.Application.Features.Planning.KPIRating.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIRating.Queries.GetKPIRatingById;

public class GetKPIRatingByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetKPIRatingByIdQuery, ApiResponse<KPIRatingResponse>>
{
    public async Task<ApiResponse<KPIRatingResponse>> Handle(GetKPIRatingByIdQuery request, CancellationToken cancellationToken)
    {
        var rating = await unitOfWork.RatingRepository.GetByIdWithJoinAsync(request.Id,
            cancellationToken) ?? throw new NotFoundException("No data found.");

        var result = new KPIRatingResponse()
        {
            Id = rating.Id,
            KPIId = rating.KPIPerformanceMeasure?.KPIId ?? Guid.Empty,
            NumericalRating = rating.NumericalRating,
            PerformanceMeasureId = rating.KPIPerformanceMeasure?.PerformanceMeasureId ?? Guid.Empty,
            Remarks = rating.Remarks,
            CreatedAt = rating.CreatedAt,
            CreatedBy = rating.CreatedBy
        };

        return ApiResponse<KPIRatingResponse>.Success(result, "Retrieved successfully");
    }
}
