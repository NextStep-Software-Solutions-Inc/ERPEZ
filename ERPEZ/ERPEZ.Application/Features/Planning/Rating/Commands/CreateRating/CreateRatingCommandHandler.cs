using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Rating.Commands.CreateRating;

public class CreateRatingCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateRatingCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateRatingCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.PerformanceMeasureRepository.FindAsync(
            t => t.Id == request.PerformanceMeasureId,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("Performance Measure should exist");

        _ = await unitOfWork.KPIRepository.GetByIdAsync(request.KPIId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI not found.");

        // Ensure KPIPerformanceMeasure exists
        var kpi = await unitOfWork.KPIRepository.GetKPIWithDetailsAsync(request.KPIId, cancellationToken)
            ?? throw new NotFoundException("KPI not found.");
        var pm = await unitOfWork.PerformanceMeasureRepository.FindAsync(
            t => t.Id == request.PerformanceMeasureId, cancellationToken: cancellationToken) ?? throw new NotFoundException("Performance Measure should exist");

        var kpm = kpi.KPIPerformanceMeasures.FirstOrDefault(x => x.PerformanceMeasureId == request.PerformanceMeasureId);
        if (kpm is null)
        {
            kpm = new Domain.Entities.Planning.KPIPerformanceMeasure
            {
                KPIId = request.KPIId,
                PerformanceMeasureId = request.PerformanceMeasureId
            };
            kpi.KPIPerformanceMeasures.Add(kpm);
        }

        var duplicate = await unitOfWork.RatingRepository.FindAsync(kr =>
                        kr.KPIPerformanceMeasureId == kpm.Id &&
                        kr.NumericalRating == request.NumericalRating, cancellationToken);
        if (duplicate != null)
        {
            throw new ConflictException("Rating already exists.");
        }
        // Create Rating and attach via navigation collections to set shadow FKs
        var rating = new Domain.Entities.Planning.Rating
        {
            NumericalRating = request.NumericalRating,
            Remarks = request.Remarks
        };
        kpm.Ratings.Add(rating);

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Guid>.Success(rating.Id, "Rating created successfully.");
    }
}
