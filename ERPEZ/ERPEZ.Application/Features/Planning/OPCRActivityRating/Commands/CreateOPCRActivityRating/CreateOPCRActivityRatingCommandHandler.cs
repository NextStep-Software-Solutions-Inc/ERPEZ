using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityRating.Commands.CreateOPCRActivityRating;

public class CreateOPCRActivityRatingCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateOPCRActivityRatingCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateOPCRActivityRatingCommand request, CancellationToken cancellationToken)
    {
        // Verify OPCRActivity exists
        var opcrActivity = await unitOfWork.OPCRActivityRepository.GetByIdAsync(request.OPCRActivityId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("OPCR Activity not found.");

        // Verify PerformanceMeasure exists
        var performanceMeasure = await unitOfWork.PerformanceMeasureRepository.GetByIdAsync(
            request.PerformanceMeasureId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Performance Measure not found.");

        // Get the KPI associated with the OPCR Activity
        var duKPITargetAssignment = await unitOfWork.DUKPITargetAssignmentRepository.GetByIdAsync(
            opcrActivity.DUKPITargetAssignmentId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI Target Assignment not found.");

        var kpi = await unitOfWork.KPIRepository.GetByIdAsync(duKPITargetAssignment.KPIId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI not found.");

        // Verify that the PerformanceMeasure belongs to the KPI
        var kpiPerformanceMeasure = await unitOfWork.KPIPerformanceMeasureRepository.FindAsync(
            kpm => kpm.KPIId == kpi.Id && kpm.PerformanceMeasureId == request.PerformanceMeasureId,
            cancellationToken: cancellationToken) ?? throw new ValidationException("The Performance Measure does not belong to the KPI associated with this OPCR Activity.");

        // Check for duplicate rating (same activity + performance measure)
        var duplicate = await unitOfWork.OPCRActivityRatingRepository.FindAsync(
            r => r.OPCRActivityId == request.OPCRActivityId && r.PerformanceMeasureId == request.PerformanceMeasureId,
            cancellationToken: cancellationToken);

        if (duplicate != null)
        {
            throw new ConflictException("A rating for this activity and performance measure already exists.");
        }

        // Create the rating
        var rating = new Domain.Entities.Planning.OPCRActivityRating
        {
            OPCRActivityId = request.OPCRActivityId,
            PerformanceMeasureId = request.PerformanceMeasureId,
            ActualAccomplishedValue = request.ActualAccomplishedValue,
            Score = request.Score,
            Remarks = request.Remarks
        };

        await unitOfWork.OPCRActivityRatingRepository.AddAsync(rating, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(rating.Id, "OPCR Activity Rating created successfully.");
    }
}
