using ERPEZ.Application.Features.Planning.Rating.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.Rating.Commands.UpdateRating;

public class UpdateRatingCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateRatingCommand, ApiResponse<RatingResponse>>
{
    public async Task<ApiResponse<RatingResponse>> Handle(UpdateRatingCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateRating;

        var rating = await unitOfWork.RatingRepository.GetByIdWithJoinAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Rating not found.");

        rating.Remarks = dto?.Remarks ?? rating.Remarks;
        rating.NumericalRating = dto?.NumericalRating ?? rating.NumericalRating;

        unitOfWork.RatingRepository.Update(rating);
        await unitOfWork.SaveChangesAsync(cancellationToken);

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

        return ApiResponse<RatingResponse>.Success(result, "Rating updated successfully.");
    }
}
