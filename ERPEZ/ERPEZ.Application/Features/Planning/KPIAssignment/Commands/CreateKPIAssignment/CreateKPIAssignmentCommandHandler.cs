using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Commands.CreateKPIAssignment;

/// <summary>
/// Creates a KPI Assignment with distribution behavior validation.
/// Implements the Target Cascading Engine logic for Summation, Uniform, Maximum, Minimum, and Milestone behaviors.
/// </summary>
public class CreateKPIAssignmentCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<CreateKPIAssignmentCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateKPIAssignmentCommand request, CancellationToken cancellationToken)
    {
        // Validate FYActiveKPI exists
        var fyActiveKPI = await unitOfWork.FYActiveKPIRepository.GetByIdAsync(request.FYActiveKPIId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException($"FYActiveKPI with ID {request.FYActiveKPIId} not found.");

        if (fyActiveKPI.Status != "TargetsSet")
        {
            throw new ValidationException(
                $"Cannot assign KPI '{fyActiveKPI.Name}' to offices. " +
                $"Targets must be set first (Current Status: {fyActiveKPI.Status}). " +
                $"Use PUT /fy-active-kpis/targets/bulk to set targets.");
        }

        // Validate Office exists
        var office = await unitOfWork.OfficeRepository.GetByIdAsync(request.OfficeId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException($"Office with ID {request.OfficeId} not found.");

        // Check for duplicate assignment
        var existingAssignment = await unitOfWork.KPIAssignmentRepository.FindAsync(
            a => a.FYActiveKPIId == request.FYActiveKPIId && a.OfficeId == request.OfficeId,
            cancellationToken);

        if (existingAssignment != null)
            throw new ConflictException("This KPI has already been assigned to this office.");

        // Parse DistributionBehavior
        if (!Enum.TryParse<DistributionBehaviorEnum>(fyActiveKPI.DistributionBehavior, true, out var distributionBehavior))
            throw new ValidationException($"Invalid DistributionBehavior: {fyActiveKPI.DistributionBehavior}");

        // Parse MeasurementUnit
        if (!Enum.TryParse<MeasurementUnitEnum>(fyActiveKPI.MeasurementUnit, true, out var measurementUnit))
            throw new ValidationException($"Invalid MeasurementUnit: {fyActiveKPI.MeasurementUnit}");

        // Get all existing assignments for this FYActiveKPI
        var existingAssignments = await unitOfWork.KPIAssignmentRepository
            .GetAssignmentsByFYActiveKPIIdAsync(request.FYActiveKPIId, cancellationToken);

        // Apply Distribution Behavior Logic
        ValidateDistributionBehavior(
            distributionBehavior,
            measurementUnit,
            fyActiveKPI,
            request.AssignedTargetAnnual,
            request.AssignedTargetQ1,
            request.AssignedTargetQ2,
            request.AssignedTargetQ3,
            request.AssignedTargetQ4,
            existingAssignments);

        // Create the assignment
        var assignment = new Domain.Entities.Planning.KPIAssignment
        {
            Id = Guid.NewGuid(),
            FYActiveKPIId = request.FYActiveKPIId,
            OfficeId = request.OfficeId,
            AssignedTargetAnnual = request.AssignedTargetAnnual,
            AssignedTargetQ1 = request.AssignedTargetQ1,
            AssignedTargetQ2 = request.AssignedTargetQ2,
            AssignedTargetQ3 = request.AssignedTargetQ3,
            AssignedTargetQ4 = request.AssignedTargetQ4,
            IsLocked = request.IsLocked,
        };

        await unitOfWork.KPIAssignmentRepository.AddAsync(assignment, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(assignment.Id, "KPI Assignment created successfully.");
    }

    private static void ValidateDistributionBehavior(
        DistributionBehaviorEnum behavior,
        MeasurementUnitEnum measurementUnit,
        Domain.Entities.Planning.FYActiveKPI fyActiveKPI,
        decimal newAssignedTarget,
        decimal? newAssignedTargetQ1,
        decimal? newAssignedTargetQ2,
        decimal? newAssignedTargetQ3,
        decimal? newAssignedTargetQ4,
        List<Domain.Entities.Planning.KPIAssignment> existingAssignments)
    {
        var agencyAnnualTarget = fyActiveKPI.AgencyTargetAnnual;
        var existingTotalAnnual = existingAssignments.Sum(a => a.AssignedTargetAnnual);
        var cumulativeTotalAnnual = existingTotalAnnual + newAssignedTarget;

        // Percentage validation: targets cannot exceed 100%
        if (measurementUnit == MeasurementUnitEnum.Percentage)
        {
            if (newAssignedTarget > 100)
            {
                throw new ValidationException(
                    $"KPI '{fyActiveKPI.Name}' measures Percentage. " +
                    $"Assigned target ({newAssignedTarget}%) cannot exceed 100%.");
            }

            if (newAssignedTargetQ1.HasValue && newAssignedTargetQ1.Value > 100)
                throw new ValidationException("Q1 percentage target cannot exceed 100%.");
            if (newAssignedTargetQ2.HasValue && newAssignedTargetQ2.Value > 100)
                throw new ValidationException("Q2 percentage target cannot exceed 100%.");
            if (newAssignedTargetQ3.HasValue && newAssignedTargetQ3.Value > 100)
                throw new ValidationException("Q3 percentage target cannot exceed 100%.");
            if (newAssignedTargetQ4.HasValue && newAssignedTargetQ4.Value > 100)
                throw new ValidationException("Q4 percentage target cannot exceed 100%.");
        }

        switch (behavior)
        {
            case DistributionBehaviorEnum.Summation:
                // Cumulative SUM (existing + new) must not exceed AgencyTargetAnnual
                if (cumulativeTotalAnnual > agencyAnnualTarget)
                {
                    var remainingTarget = agencyAnnualTarget - existingTotalAnnual;
                    throw new ValidationException(
                        $"KPI '{fyActiveKPI.Name}' has Summation behavior. " +
                        $"Total assigned ({cumulativeTotalAnnual:F2}) would exceed agency annual target ({agencyAnnualTarget:F2}). " +
                        $"Already assigned: {existingTotalAnnual:F2}, Attempting to assign: {newAssignedTarget:F2}. " +
                        $"Maximum remaining: {remainingTarget:F2}.");
                }
                break;

            case DistributionBehaviorEnum.Uniform:
                // Every office receives the exact same target as agency
                if (Math.Abs(newAssignedTarget - agencyAnnualTarget) > 0.01m)
                {
                    throw new ValidationException(
                        $"KPI '{fyActiveKPI.Name}' has Uniform behavior. " +
                        $"Each office must receive the exact agency annual target ({agencyAnnualTarget}). " +
                        $"Attempting to assign: {newAssignedTarget}.");
                }
                
                // For Uniform, each provided quarterly target must equal the assigned annual target
                if (newAssignedTargetQ1.HasValue && Math.Abs(newAssignedTargetQ1.Value - newAssignedTarget) > 0.01m)
                    throw new ValidationException($"For Uniform behavior, Q1 target must equal assigned annual target ({newAssignedTarget}).");
                if (newAssignedTargetQ2.HasValue && Math.Abs(newAssignedTargetQ2.Value - newAssignedTarget) > 0.01m)
                    throw new ValidationException($"For Uniform behavior, Q2 target must equal assigned annual target ({newAssignedTarget}).");
                if (newAssignedTargetQ3.HasValue && Math.Abs(newAssignedTargetQ3.Value - newAssignedTarget) > 0.01m)
                    throw new ValidationException($"For Uniform behavior, Q3 target must equal assigned annual target ({newAssignedTarget}).");
                if (newAssignedTargetQ4.HasValue && Math.Abs(newAssignedTargetQ4.Value - newAssignedTarget) > 0.01m)
                    throw new ValidationException($"For Uniform behavior, Q4 target must equal assigned annual target ({newAssignedTarget}).");
                break;

            case DistributionBehaviorEnum.Maximum:
                if (newAssignedTarget > agencyAnnualTarget)
                {
                    throw new ValidationException(
                        $"KPI '{fyActiveKPI.Name}' has Maximum behavior. " +
                        $"No office target may exceed the agency annual target ({agencyAnnualTarget}). " +
                        $"Attempting to assign: {newAssignedTarget}.");
                }
                break;

            case DistributionBehaviorEnum.Minimum:
                if (newAssignedTarget < agencyAnnualTarget)
                {
                    throw new ValidationException(
                        $"KPI '{fyActiveKPI.Name}' has Minimum behavior. " +
                        $"No office target may be below the agency annual target ({agencyAnnualTarget}). " +
                        $"Attempting to assign: {newAssignedTarget}.");
                }
                break;

            case DistributionBehaviorEnum.Milestone:
                // Event-based KPIs with flexible target assignment
                break;

            default:
                throw new ValidationException($"Unsupported DistributionBehavior: {behavior}");
        }
    }
}
