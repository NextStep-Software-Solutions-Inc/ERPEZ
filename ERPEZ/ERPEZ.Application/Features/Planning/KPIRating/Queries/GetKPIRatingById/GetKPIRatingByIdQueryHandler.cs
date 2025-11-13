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
        var kPIRating = await unitOfWork.KPIRatingRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        var result = new KPIRatingResponse()
        {
            Id = kPIRating.Id,
            KPIId = kPIRating.KPIId,
            NumericalRating = kPIRating.NumericalRating,
            PerformanceMeasureId = kPIRating.PerformanceMeasureId,
            Remarks = kPIRating.Remarks,
            CreatedAt = kPIRating.CreatedAt,
            CreatedBy = kPIRating.CreatedBy
        };

        return ApiResponse<KPIRatingResponse>.Success(result, "Retrieved successfully");
    }
}
