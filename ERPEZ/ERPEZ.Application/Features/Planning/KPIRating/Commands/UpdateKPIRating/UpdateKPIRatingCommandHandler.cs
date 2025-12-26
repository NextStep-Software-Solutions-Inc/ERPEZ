using ERPEZ.Application.Features.Planning.KPIRating.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIRating.Commands.UpdateKPIRating;

public class UpdateKPIRatingCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateKPIRatingCommand, ApiResponse<KPIRatingResponse>>
{
    public async Task<ApiResponse<KPIRatingResponse>> Handle(UpdateKPIRatingCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateRating;

        var rating = await unitOfWork.RatingRepository.GetByIdWithJoinAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Rating not found.");

        rating.Remarks = dto?.Remarks ?? rating.Remarks;
        rating.NumericalRating = dto?.NumericalRating ?? rating.NumericalRating;

        unitOfWork.RatingRepository.Update(rating);
        await unitOfWork.SaveChangesAsync(cancellationToken);

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

        return ApiResponse<KPIRatingResponse>.Success(result, "KPI Rating updated successfully.");
    }
}
