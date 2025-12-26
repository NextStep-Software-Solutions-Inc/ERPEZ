using ERPEZ.Application.Features.Planning.Rating.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.Rating.Queries.GetRatingById;

public class GetRatingByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetRatingByIdQuery, ApiResponse<RatingResponse>>
{
    public async Task<ApiResponse<RatingResponse>> Handle(GetRatingByIdQuery request, CancellationToken cancellationToken)
    {
        var rating = await unitOfWork.RatingRepository.GetByIdWithJoinAsync(request.Id,
            cancellationToken) ?? throw new NotFoundException("No data found.");

        var result = new RatingResponse()
        {
            Id = rating.Id,
            KPIId = rating.KPIPerformanceMeasure?.KPIId ?? Guid.Empty,
            NumericalRating = rating.NumericalRating,
            PerformanceMeasureId = rating.KPIPerformanceMeasure?.PerformanceMeasureId ?? Guid.Empty,
            Remarks = rating.Remarks,
            CreatedAt = rating.CreatedAt,
            CreatedBy = rating.CreatedBy
        };

        return ApiResponse<RatingResponse>.Success(result, "Retrieved successfully");
    }
}
