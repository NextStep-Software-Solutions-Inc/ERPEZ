using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityRating.Commands.CreateOPCRActivityRatingsBatch;

/// <summary>
/// Handler for creating multiple OPCR Activity Ratings in a single transaction.
/// </summary>
public class CreateOPCRActivityRatingsBatchCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateOPCRActivityRatingsBatchCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        CreateOPCRActivityRatingsBatchCommand request,
        CancellationToken cancellationToken)
    {
        // Verify OPCRActivity exists
        var opcrActivity = await unitOfWork.OPCRActivityRepository.GetByIdAsync(
            request.OPCRActivityId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("OPCR Activity not found.");

        // Get the KPI associated with the OPCR Activity
        var duKPITargetAssignment = await unitOfWork.DUKPITargetAssignmentRepository.GetByIdAsync(
            opcrActivity.DUKPITargetAssignmentId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI Target Assignment not found.");

        var kpi = await unitOfWork.KPIRepository.GetByIdAsync(
            duKPITargetAssignment.KPIId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI not found.");

        // Get all performance measure IDs from the batch
        var performanceMeasureIds = request.Ratings.Select(r => r.PerformanceMeasureId).Distinct().ToList();

        // Verify all PerformanceMeasures exist and belong to the KPI
        var kpiPerformanceMeasuresQuery = unitOfWork.KPIPerformanceMeasureRepository.Query(
            kpm => kpm.KPIId == kpi.Id && performanceMeasureIds.Contains(kpm.PerformanceMeasureId));

        var kpiPerformanceMeasures = await unitOfWork.KPIPerformanceMeasureRepository.ToListAsync(
            kpiPerformanceMeasuresQuery, cancellationToken);

        var validPerformanceMeasureIds = kpiPerformanceMeasures.Select(kpm => kpm.PerformanceMeasureId).ToHashSet();

        var invalidPerformanceMeasureIds = performanceMeasureIds
            .Where(id => !validPerformanceMeasureIds.Contains(id))
            .ToList();

        if (invalidPerformanceMeasureIds.Any())
        {
            throw new ValidationException(
                $"The following Performance Measures do not belong to the KPI associated with this OPCR Activity: {string.Join(", ", invalidPerformanceMeasureIds)}");
        }

        // Check for existing ratings (same activity + performance measure combinations)
        var existingRatingsQuery = unitOfWork.OPCRActivityRatingRepository.Query(
            r => r.OPCRActivityId == request.OPCRActivityId &&
                 performanceMeasureIds.Contains(r.PerformanceMeasureId));

        var existingRatings = await unitOfWork.OPCRActivityRatingRepository.ToListAsync(
            existingRatingsQuery, cancellationToken);

        var existingPerformanceMeasureIds = existingRatings
            .Select(r => r.PerformanceMeasureId)
            .ToHashSet();

        var conflictingPerformanceMeasureIds = request.Ratings
            .Where(r => existingPerformanceMeasureIds.Contains(r.PerformanceMeasureId))
            .Select(r => r.PerformanceMeasureId)
            .Distinct()
            .ToList();

        if (conflictingPerformanceMeasureIds.Any())
        {
            throw new ConflictException(
                $"Ratings for the following Performance Measures already exist for this OPCR Activity: {string.Join(", ", conflictingPerformanceMeasureIds)}");
        }

        // Check for duplicates within the batch
        var batchPerformanceMeasureIds = request.Ratings
            .GroupBy(r => r.PerformanceMeasureId)
            .Where(g => g.Count() > 1)
            .Select(g => g.Key)
            .ToList();

        if (batchPerformanceMeasureIds.Any())
        {
            throw new ValidationException(
                $"Duplicate Performance Measure IDs found in the batch: {string.Join(", ", batchPerformanceMeasureIds)}");
        }

        // Create all ratings
        var ratings = request.Ratings.Select(item => new Domain.Entities.Planning.OPCRActivityRating
        {
            OPCRActivityId = request.OPCRActivityId,
            PerformanceMeasureId = item.PerformanceMeasureId,
            ActualAccomplishedValue = request.ActualAccomplishedValue,
            Score = item.Score,
            Remarks = item.Remarks
        }).ToList();

        await unitOfWork.OPCRActivityRatingRepository.AddRangeAsync(ratings, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(
            Unit.Value,
            $"{ratings.Count} OPCR Activity Ratings created successfully.");
    }
}