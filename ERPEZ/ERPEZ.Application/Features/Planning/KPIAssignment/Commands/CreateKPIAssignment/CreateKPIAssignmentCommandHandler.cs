using ERPEZ.Application.Features.Planning.KPIAssignment.Validators;
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
public class CreateKPIAssignmentCommandHandler(IUnitOfWork unitOfWork, IKPIAssignmentBehaviorValidator behaviorValidator) 
    : IRequestHandler<CreateKPIAssignmentCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateKPIAssignmentCommand request, CancellationToken cancellationToken)
    {
        // Validate Source enum
        if (!Enum.TryParse<KPIAssignmentSourceEnum>(request.Source, true, out var sourceEnum))
            throw new ValidationException($"Invalid Source: {request.Source}. Must be 'Assigned' or 'Shopped'.");

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

        // For Shopped assignments, validate the KPI is marked as opt-in available
        if (sourceEnum == KPIAssignmentSourceEnum.Shopped && !fyActiveKPI.IsOptInAvailable)
            throw new ValidationException($"KPI '{fyActiveKPI.Name}' is not available for opt-in. Only KPIs marked as opt-in available can be shopped by offices.");

        // Validate Office exists
        _ = await unitOfWork.OfficeRepository.GetByIdAsync(request.OfficeId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException($"Office with ID {request.OfficeId} not found.");

        // Check for duplicate assignment
        var existingAssignment = await unitOfWork.KPIAssignmentRepository.FindAsync(
            a => a.FYActiveKPIId == request.FYActiveKPIId && a.OfficeId == request.OfficeId,
            cancellationToken);

        if (existingAssignment != null)
            throw new ConflictException("This KPI has already been assigned to this office.");

        // Validate Source-specific invariants
        if (sourceEnum == KPIAssignmentSourceEnum.Assigned)
        {
            // Assigned: AssignedTargetAnnual is required and must be inherited
            if (request.AssignedTargetAnnual == null || request.AssignedTargetAnnual <= 0)
                throw new ValidationException("For Source='Assigned', AssignedTargetAnnual must be provided and greater than 0.");
        }
        else if (sourceEnum == KPIAssignmentSourceEnum.Shopped)
        {
            // Shopped: AssignedTargetAnnual must be null (Office will propose later)
            if (request.AssignedTargetAnnual != null)
                throw new ValidationException("For Source='Shopped', AssignedTargetAnnual must be null. Office will propose their own target.");
        }

        // Only apply distribution behavior validation for Assigned source
        if (sourceEnum == KPIAssignmentSourceEnum.Assigned)
        {
            // Parse DistributionBehavior
            if (!Enum.TryParse<DistributionBehaviorEnum>(fyActiveKPI.DistributionBehavior, true, out var distributionBehavior))
                throw new ValidationException($"Invalid DistributionBehavior: {fyActiveKPI.DistributionBehavior}");

            // Parse MeasurementUnit
            if (!Enum.TryParse<MeasurementUnitEnum>(fyActiveKPI.MeasurementUnit, true, out var measurementUnit))
                throw new ValidationException($"Invalid MeasurementUnit: {fyActiveKPI.MeasurementUnit}");

            // Get all existing assignments for this FYActiveKPI
            var existingAssignments = await unitOfWork.KPIAssignmentRepository
                .GetAssignmentsByFYActiveKPIIdAsync(request.FYActiveKPIId, cancellationToken);

            var existingTotalAnnual = existingAssignments.Sum(a => a.AssignedTargetAnnual ?? 0m);
            var cumulativeTotalAnnual = existingTotalAnnual + (request.AssignedTargetAnnual ?? 0);

            // Apply Distribution Behavior Logic
            if (measurementUnit == MeasurementUnitEnum.Percentage)
            {
                behaviorValidator.ValidatePercentageMeasurement(
                    fyActiveKPI.Name,
                    request.AssignedTargetAnnual ?? 0,
                    request.AssignedTargetQ1,
                    request.AssignedTargetQ2,
                    request.AssignedTargetQ3,
                    request.AssignedTargetQ4);
            }

            switch (distributionBehavior)
            {
                case DistributionBehaviorEnum.Summation:
                    behaviorValidator.ValidateSummation(
                        fyActiveKPI.Name,
                        fyActiveKPI.AgencyTargetAnnual,
                        cumulativeTotalAnnual,
                        existingTotalAnnual,
                        request.AssignedTargetAnnual ?? 0);
                    break;

                case DistributionBehaviorEnum.Uniform:
                    behaviorValidator.ValidateUniform(fyActiveKPI.Name, fyActiveKPI.AgencyTargetAnnual, request.AssignedTargetAnnual ?? 0);
                    behaviorValidator.ValidateUniformQuarterly(
                        fyActiveKPI.Name,
                        request.AssignedTargetAnnual ?? 0,
                        request.AssignedTargetQ1,
                        request.AssignedTargetQ2,
                        request.AssignedTargetQ3,
                        request.AssignedTargetQ4);
                    break;

                case DistributionBehaviorEnum.Maximum:
                    behaviorValidator.ValidateMaximum(fyActiveKPI.Name, fyActiveKPI.AgencyTargetAnnual, request.AssignedTargetAnnual ?? 0);
                    break;

                case DistributionBehaviorEnum.Minimum:
                    behaviorValidator.ValidateMinimum(fyActiveKPI.Name, fyActiveKPI.AgencyTargetAnnual, request.AssignedTargetAnnual ?? 0);
                    break;

                case DistributionBehaviorEnum.Milestone:
                    // Event-based KPIs with flexible target assignment
                    break;
            }
        }

        // Create the assignment
        var assignment = new Domain.Entities.Planning.KPIAssignment
        {
            Id = Guid.NewGuid(),
            FYActiveKPIId = request.FYActiveKPIId,
            OfficeId = request.OfficeId,
            Source = request.Source,
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
}
