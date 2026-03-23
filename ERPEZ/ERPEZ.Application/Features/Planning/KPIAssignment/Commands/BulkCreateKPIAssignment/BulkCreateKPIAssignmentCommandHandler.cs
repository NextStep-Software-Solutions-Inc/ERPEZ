using ERPEZ.Application.Features.Planning.KPIAssignment.Validators;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Commands.BulkCreateKPIAssignment;

public class BulkCreateKPIAssignmentCommandHandler(IUnitOfWork unitOfWork, IKPIAssignmentBehaviorValidator behaviorValidator)
    : IRequestHandler<BulkCreateKPIAssignmentCommand, ApiResponse<BulkAssignmentResult>>
{
    public async Task<ApiResponse<BulkAssignmentResult>> Handle(
        BulkCreateKPIAssignmentCommand request, 
        CancellationToken cancellationToken)
    {
        var createdAssignmentIds = new List<Guid>();
        int totalKPIsProcessed = 0;
        int totalOfficesAssigned = 0;

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            foreach (var kpiAssignment in request.Assignments)
            {
                // Validate FYActiveKPI exists and has targets set
                var fyActiveKPI = await unitOfWork.FYActiveKPIRepository.GetByIdAsync(
                    kpiAssignment.FYActiveKPIId, 
                    cancellationToken: cancellationToken)
                    ?? throw new NotFoundException($"FYActiveKPI with ID {kpiAssignment.FYActiveKPIId} not found.");

                if (fyActiveKPI.Status != "TargetsSet")
                {
                    throw new ValidationException(
                        $"Cannot assign KPI '{fyActiveKPI.Name}' to offices. " +
                        $"Targets must be set first (Current Status: {fyActiveKPI.Status}). " +
                        $"Use PUT /fy-active-kpis/targets/bulk to set targets.");
                }

                // For any Shopped office assignments in this batch, validate opt-in availability
                var hasShoppedEntries = kpiAssignment.OfficeAssignments
                    .Any(o => string.Equals(o.Source, "Shopped", StringComparison.OrdinalIgnoreCase));
                if (hasShoppedEntries && !fyActiveKPI.IsOptInAvailable)
                    throw new ValidationException($"KPI '{fyActiveKPI.Name}' is not available for opt-in. Only KPIs marked as opt-in available can be shopped by offices.");

                // Check for duplicate office assignments within this KPI
                var officeIds = kpiAssignment.OfficeAssignments.Select(o => o.OfficeId).ToList();
                if (officeIds.Count != officeIds.Distinct().Count())
                {
                    throw new ValidationException($"KPI '{fyActiveKPI.Name}' has duplicate office assignments.");
                }

                // Check if any offices are already assigned to this KPI
                var existingAssignments = await unitOfWork.KPIAssignmentRepository.ToListAsync(
                    unitOfWork.KPIAssignmentRepository.Query(
                        a => a.FYActiveKPIId == kpiAssignment.FYActiveKPIId && 
                             officeIds.Contains(a.OfficeId)),
                    cancellationToken);

                if (existingAssignments.Any())
                {
                    throw new ConflictException(
                        $"KPI '{fyActiveKPI.Name}' is already assigned to {existingAssignments.Count} office(s). " +
                        $"Remove existing assignments first or use PUT to update.");
                }

                // Validate distribution behavior
                await ValidateDistributionBehavior(
                    fyActiveKPI,
                    kpiAssignment.OfficeAssignments
                        .Where(o => string.Equals(o.Source, "Assigned", StringComparison.OrdinalIgnoreCase))
                        .ToList(),
                    cancellationToken);

                // Create assignments for each office
                foreach (var officeAssignment in kpiAssignment.OfficeAssignments)
                {
                    if (!Enum.TryParse<KPIAssignmentSourceEnum>(officeAssignment.Source, true, out _))
                        throw new ValidationException($"Invalid Source: {officeAssignment.Source}. Must be 'Assigned' or 'Shopped'.");

                    // Validate office exists
                    _ = await unitOfWork.OfficeRepository.GetByIdAsync(
                        officeAssignment.OfficeId, 
                        cancellationToken: cancellationToken)
                        ?? throw new NotFoundException($"Office with ID {officeAssignment.OfficeId} not found.");

                    var assignmentId = Guid.NewGuid();
                    var assignment = new Domain.Entities.Planning.KPIAssignment
                    {
                        Id = assignmentId,
                        FYActiveKPIId = kpiAssignment.FYActiveKPIId,
                        OfficeId = officeAssignment.OfficeId,
                        Source = officeAssignment.Source,
                        AssignedTargetAnnual = officeAssignment.AssignedTargetAnnual,
                        AssignedTargetQ1 = officeAssignment.AssignedTargetQ1,
                        AssignedTargetQ2 = officeAssignment.AssignedTargetQ2,
                        AssignedTargetQ3 = officeAssignment.AssignedTargetQ3,
                        AssignedTargetQ4 = officeAssignment.AssignedTargetQ4,
                        IsLocked = officeAssignment.IsLocked
                    };

                    await unitOfWork.KPIAssignmentRepository.AddAsync(assignment, cancellationToken);
                    createdAssignmentIds.Add(assignmentId);
                    totalOfficesAssigned++;
                }

                totalKPIsProcessed++;
            }

            await unitOfWork.SaveChangesAsync(cancellationToken);
        }, cancellationToken);

        var result = new BulkAssignmentResult
        {
            TotalKPIsProcessed = totalKPIsProcessed,
            TotalOfficesAssigned = totalOfficesAssigned,
            CreatedAssignmentIds = createdAssignmentIds
        };

        return ApiResponse<BulkAssignmentResult>.Success(
            result, 
            $"Successfully assigned {totalKPIsProcessed} KPI(s) to {totalOfficesAssigned} office(s).");
    }

    private async Task ValidateDistributionBehavior(
        Domain.Entities.Planning.FYActiveKPI fyActiveKPI, 
        List<OfficeTargetAssignment> officeAssignments,
        CancellationToken cancellationToken)
    {
        if (officeAssignments.Count == 0)
            return;

        if (!Enum.TryParse<MeasurementUnitEnum>(fyActiveKPI.MeasurementUnit, true, out var measurementUnit))
            throw new ValidationException($"Invalid MeasurementUnit on FYActiveKPI '{fyActiveKPI.Name}': {fyActiveKPI.MeasurementUnit}");

        if (!Enum.TryParse<DistributionBehaviorEnum>(fyActiveKPI.DistributionBehavior, true, out var distributionBehavior))
            throw new ValidationException($"Invalid DistributionBehavior on FYActiveKPI '{fyActiveKPI.Name}': {fyActiveKPI.DistributionBehavior}");

        var agencyAnnualTarget = fyActiveKPI.AgencyTargetAnnual;
        var totalAssignedAnnual = officeAssignments.Sum(o => o.AssignedTargetAnnual ?? 0m);

        // Get existing assignments for this KPI to track cumulative totals
        var existingAssignments = await unitOfWork.KPIAssignmentRepository.ToListAsync(
            unitOfWork.KPIAssignmentRepository.Query(a => a.FYActiveKPIId == fyActiveKPI.Id),
            cancellationToken);

        var existingTotalAnnual = existingAssignments.Sum(a => a.AssignedTargetAnnual ?? 0m);
        var cumulativeTotalAnnual = existingTotalAnnual + totalAssignedAnnual;

        // Percentage validation: targets cannot exceed 100%
        if (measurementUnit == MeasurementUnitEnum.Percentage)
        {
            foreach (var office in officeAssignments)
            {
                behaviorValidator.ValidatePercentageMeasurement(
                    fyActiveKPI.Name,
                    office.AssignedTargetAnnual ?? 0m,
                    office.AssignedTargetQ1,
                    office.AssignedTargetQ2,
                    office.AssignedTargetQ3,
                    office.AssignedTargetQ4);
            }
        }

        switch (distributionBehavior)
        {
            case DistributionBehaviorEnum.Summation:
                behaviorValidator.ValidateSummation(
                    fyActiveKPI.Name,
                    agencyAnnualTarget,
                    cumulativeTotalAnnual,
                    existingTotalAnnual,
                    totalAssignedAnnual);
                break;

            case DistributionBehaviorEnum.Uniform:
                // All offices must receive the exact same target
                foreach (var office in officeAssignments)
                {
                    behaviorValidator.ValidateUniform(fyActiveKPI.Name, agencyAnnualTarget, office.AssignedTargetAnnual ?? 0m);
                    behaviorValidator.ValidateUniformQuarterly(
                        fyActiveKPI.Name,
                        office.AssignedTargetAnnual ?? 0m,
                        office.AssignedTargetQ1,
                        office.AssignedTargetQ2,
                        office.AssignedTargetQ3,
                        office.AssignedTargetQ4);
                }
                break;

            case DistributionBehaviorEnum.Maximum:
                foreach (var office in officeAssignments)
                {
                    behaviorValidator.ValidateMaximum(fyActiveKPI.Name, agencyAnnualTarget, office.AssignedTargetAnnual ?? 0m);
                }
                break;

            case DistributionBehaviorEnum.Minimum:
                foreach (var office in officeAssignments)
                {
                    behaviorValidator.ValidateMinimum(fyActiveKPI.Name, agencyAnnualTarget, office.AssignedTargetAnnual ?? 0m);
                }
                break;

            case DistributionBehaviorEnum.Milestone:
                // Event-based KPIs: flexible target assignment
                break;
        }
    }
}
