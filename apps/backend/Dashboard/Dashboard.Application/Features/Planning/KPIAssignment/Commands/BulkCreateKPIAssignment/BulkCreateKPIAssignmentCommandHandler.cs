using ERPEZ.Application.Common.Validators;
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

                if (fyActiveKPI.Status != nameof(Domain.Enums.FYActiveKPIStatus.TargetsSet) && fyActiveKPI.Status != nameof(Domain.Enums.FYActiveKPIStatus.Assigned))
                {
                    throw new ValidationException(
                        $"Cannot assign KPI '{fyActiveKPI.Name}' to offices. " +
                        $"Targets must be set first (Current Status: {fyActiveKPI.Status}). " +
                        $"Use PUT /fy-active-kpis/targets/bulk to set targets.");
                }

                // Check for duplicate office assignments within this KPI
                var officeIds = kpiAssignment.OfficeAssignments.Select(o => o.OfficeId).ToList();
                if (officeIds.Count != officeIds.Distinct().Count())
                {
                    throw new ValidationException($"KPI '{fyActiveKPI.Name}' has duplicate office assignments.");
                }

                // Query all existing assignments for the offices in the request
                var existingAssignments = await unitOfWork.KPIAssignmentRepository.ToListAsync(
                    unitOfWork.KPIAssignmentRepository.Query(
                        a => a.FYActiveKPIId == kpiAssignment.FYActiveKPIId && 
                             officeIds.Contains(a.OfficeId)),
                    cancellationToken);

                // If any assignments already exist, verify their OPCR status is Draft
                foreach (var existing in existingAssignments)
                {
                    var opcr = await unitOfWork.OPCRRepository.FindAsync(
                        o => o.OfficeId == existing.OfficeId && o.FiscalYearId == fyActiveKPI.FiscalYearId,
                        cancellationToken);

                    if (opcr != null && !opcr.CommitmentStatus.Equals("Draft", StringComparison.OrdinalIgnoreCase))
                    {
                        throw new ValidationException(
                            $"Cannot update assignment for KPI '{fyActiveKPI.Name}' and office '{existing.OfficeId}' - the OPCR commitment status is '{opcr.CommitmentStatus}'.");
                    }
                }

                // Validate distribution behavior
                await ValidateDistributionBehavior(
                    fyActiveKPI,
                    kpiAssignment.OfficeAssignments.ToList(),
                    cancellationToken);

                // Create or update assignments for each office
                foreach (var officeAssignment in kpiAssignment.OfficeAssignments)
                {
                    var existingAssignment = existingAssignments.FirstOrDefault(a => a.OfficeId == officeAssignment.OfficeId);
                    if (existingAssignment != null)
                    {
                        // Update existing assignment
                        existingAssignment.AssignedTargetAnnual = officeAssignment.AssignedTargetAnnual;
                        existingAssignment.AssignedTargetQ1 = officeAssignment.AssignedTargetQ1;
                        existingAssignment.AssignedTargetQ2 = officeAssignment.AssignedTargetQ2;
                        existingAssignment.AssignedTargetQ3 = officeAssignment.AssignedTargetQ3;
                        existingAssignment.AssignedTargetQ4 = officeAssignment.AssignedTargetQ4;
                        existingAssignment.IsLocked = officeAssignment.IsLocked;

                        unitOfWork.KPIAssignmentRepository.Update(existingAssignment);
                        createdAssignmentIds.Add(existingAssignment.Id);
                        totalOfficesAssigned++;
                    }
                    else
                    {
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
                }

                fyActiveKPI.Status = nameof(Domain.Enums.FYActiveKPIStatus.Assigned);
                unitOfWork.FYActiveKPIRepository.Update(fyActiveKPI);

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
        if (!Enum.TryParse<MeasurementUnitEnum>(fyActiveKPI.MeasurementUnit, true, out var measurementUnit))
            throw new ValidationException($"Invalid MeasurementUnit on FYActiveKPI '{fyActiveKPI.Name}': {fyActiveKPI.MeasurementUnit}");

        if (!ValidationUtilities.TryParseDistributionBehavior(fyActiveKPI.DistributionBehavior, out var distributionBehavior))
            throw new ValidationException(
                $"Invalid DistributionBehavior on FYActiveKPI '{fyActiveKPI.Name}'. " +
                $"Received '{fyActiveKPI.DistributionBehavior}'. " +
                $"Normalized value: '{ValidationUtilities.NormalizeDistributionBehavior(fyActiveKPI.DistributionBehavior)}'. " +
                $"Accepted values: {ValidationUtilities.GetDistributionBehaviorOptions()}.");

        var agencyAnnualTarget = fyActiveKPI.AgencyTargetAnnual;
        var totalAssignedAnnual = officeAssignments.Sum(o => o.AssignedTargetAnnual);

        // Get existing assignments for this KPI to track cumulative totals
        var existingAssignments = await unitOfWork.KPIAssignmentRepository.ToListAsync(
            unitOfWork.KPIAssignmentRepository.Query(a => a.FYActiveKPIId == fyActiveKPI.Id),
            cancellationToken);

        // Build a set of office IDs in the request to check for overlaps
        var newOfficeIds = officeAssignments.Select(o => o.OfficeId).ToHashSet();

        // Calculate the existing total for offices that are NOT in the current request
        var existingTotalForOtherOffices = existingAssignments
            .Where(a => !newOfficeIds.Contains(a.OfficeId))
            .Sum(a => a.AssignedTargetAnnual);

        var cumulativeTotalAnnual = existingTotalForOtherOffices + totalAssignedAnnual;

        // Percentage validation: targets cannot exceed 100%
        if (measurementUnit == MeasurementUnitEnum.Percentage)
        {
            foreach (var office in officeAssignments)
            {
                behaviorValidator.ValidatePercentageMeasurement(
                    fyActiveKPI.Name,
                    office.AssignedTargetAnnual,
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
                    existingTotalForOtherOffices,
                    totalAssignedAnnual);
                break;

            case DistributionBehaviorEnum.Uniform:
                // All offices must receive the exact same target
                foreach (var office in officeAssignments)
                {
                    behaviorValidator.ValidateUniform(fyActiveKPI.Name, agencyAnnualTarget, office.AssignedTargetAnnual);
                    behaviorValidator.ValidateUniformQuarterly(
                        fyActiveKPI.Name,
                        office.AssignedTargetAnnual,
                        office.AssignedTargetQ1,
                        office.AssignedTargetQ2,
                        office.AssignedTargetQ3,
                        office.AssignedTargetQ4);
                }
                break;

            case DistributionBehaviorEnum.Maximum:
                foreach (var office in officeAssignments)
                {
                    behaviorValidator.ValidateMaximum(fyActiveKPI.Name, agencyAnnualTarget, office.AssignedTargetAnnual);
                }
                break;

            case DistributionBehaviorEnum.Minimum:
                foreach (var office in officeAssignments)
                {
                    behaviorValidator.ValidateMinimum(fyActiveKPI.Name, agencyAnnualTarget, office.AssignedTargetAnnual);
                }
                break;

            case DistributionBehaviorEnum.Milestone:
                // Event-based KPIs: flexible target assignment
                break;
        }
    }
}
