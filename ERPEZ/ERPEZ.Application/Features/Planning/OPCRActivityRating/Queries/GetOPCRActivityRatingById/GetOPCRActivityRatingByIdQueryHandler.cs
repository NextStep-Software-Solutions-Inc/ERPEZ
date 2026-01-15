using ERPEZ.Application.Features.Planning.OPCRActivityRating.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityRating.Queries.GetOPCRActivityRatingById;

public class GetOPCRActivityRatingByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetOPCRActivityRatingByIdQuery, ApiResponse<OPCRActivityRatingDetailedResponse>>
{
    public async Task<ApiResponse<OPCRActivityRatingDetailedResponse>> Handle(
        GetOPCRActivityRatingByIdQuery request,
        CancellationToken cancellationToken)
    {
        var rating = await unitOfWork.OPCRActivityRatingRepository.GetByIdWithDetailsAsync(
            request.Id,
            cancellationToken) ?? throw new NotFoundException("OPCR Activity Rating not found.");

        var result = new OPCRActivityRatingDetailedResponse
        {
            Id = rating.Id,
            OPCRActivityId = rating.OPCRActivityId,
            OPCRActivityName = rating.OPCRActivity?.Name ?? string.Empty,
            PerformanceMeasureId = rating.PerformanceMeasureId,
            PerformanceMeasureName = rating.PerformanceMeasure?.Name ?? string.Empty,
            ActualAccomplishedValue = rating.ActualAccomplishedValue,
            Score = rating.Score,
            Remarks = rating.Remarks,
            Status = rating.Status,
            SubmittedDate = rating.SubmittedDate,
            CreatedAt = rating.CreatedAt,
            CreatedBy = rating.CreatedBy
        };

        return ApiResponse<OPCRActivityRatingDetailedResponse>.Success(result, "Retrieved successfully.");
    }
}
