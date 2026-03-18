using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Commands.BulkCreateKPIAssignment;

public class BulkCreateKPIAssignmentCommandHandler(IUnitOfWork unitOfWork)
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
                    var existingOfficeIds = existingAssignments.Select(a => a.OfficeId).ToList();
                    throw new ConflictException(
                        $"KPI '{fyActiveKPI.Name}' is already assigned to {existingAssignments.Count} office(s). " +
                        $"Remove existing assignments first or use PUT to update.");
                }

                // Validate distribution behavior
                ValidateDistributionBehavior(fyActiveKPI, kpiAssignment.OfficeAssignments.ToList());

                // Create assignments for each office
                foreach (var officeAssignment in kpiAssignment.OfficeAssignments)
                {
                    // Validate office exists
                    var office = await unitOfWork.OfficeRepository.GetByIdAsync(
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

    private void ValidateDistributionBehavior(
        Domain.Entities.Planning.FYActiveKPI fyActiveKPI, 
        List<OfficeTargetAssignment> officeAssignments)
    {
        var distributionBehavior = fyActiveKPI.DistributionBehavior?.ToLower();
        var measurementUnit = fyActiveKPI.MeasurementUnit?.ToLower();
        var agencyAnnualTarget = fyActiveKPI.AgencyTargetAnnual;
        var totalAssignedAnnual = officeAssignments.Sum(o => o.AssignedTargetAnnual);

        // Get existing assignments for this KPI to track cumulative totals
        var existingAssignments = unitOfWork.KPIAssignmentRepository
            .Query(a => a.FYActiveKPIId == fyActiveKPI.Id)
            .ToList();
        
        var existingTotalAnnual = existingAssignments.Sum(a => a.AssignedTargetAnnual);
        var cumulativeTotalAnnual = existingTotalAnnual + totalAssignedAnnual;

        // Percentage validation: targets cannot exceed 100%
        if (measurementUnit == "percentage")
        {
            foreach (var office in officeAssignments)
            {
                if (office.AssignedTargetAnnual > 100)
                {
                    throw new ValidationException(
                        $"KPI '{fyActiveKPI.Name}' measures Percentage. " +
                        $"Office {office.OfficeId} target ({office.AssignedTargetAnnual}%) cannot exceed 100%.");
                }

                // Validate quarterly percentage targets as well
                if (office.AssignedTargetQ1.HasValue && office.AssignedTargetQ1.Value > 100)
                    throw new ValidationException($"Q1 percentage target cannot exceed 100%.");
                if (office.AssignedTargetQ2.HasValue && office.AssignedTargetQ2.Value > 100)
                    throw new ValidationException($"Q2 percentage target cannot exceed 100%.");
                if (office.AssignedTargetQ3.HasValue && office.AssignedTargetQ3.Value > 100)
                    throw new ValidationException($"Q3 percentage target cannot exceed 100%.");
                if (office.AssignedTargetQ4.HasValue && office.AssignedTargetQ4.Value > 100)
                    throw new ValidationException($"Q4 percentage target cannot exceed 100%.");
            }
        }

        switch (distributionBehavior)
        {
            case "summation":
                // Cumulative sum (existing + new) must not exceed agency annual target
                // This supports incremental assignment and prevents over-allocation
                if (cumulativeTotalAnnual > agencyAnnualTarget)
                {
                    var remainingTarget = agencyAnnualTarget - existingTotalAnnual;
                    throw new ValidationException(
                        $"KPI '{fyActiveKPI.Name}' has Summation behavior. " +
                        $"Total assigned ({cumulativeTotalAnnual:F2}) exceeds agency annual target ({agencyAnnualTarget:F2}). " +
                        $"Already assigned: {existingTotalAnnual:F2}, Attempting to assign: {totalAssignedAnnual:F2}. " +
                        $"Maximum remaining: {remainingTarget:F2}.");
                }
                break;

            case "uniform":
                // All offices must receive the exact same target (equals agency target)
                // Each provided quarterly target must equal the assigned annual target
                foreach (var office in officeAssignments)
                {
                    if (Math.Abs(office.AssignedTargetAnnual - agencyAnnualTarget) > 0.01m)
                    {
                        throw new ValidationException(
                            $"KPI '{fyActiveKPI.Name}' has Uniform behavior. " +
                            $"Each office must receive the exact agency annual target ({agencyAnnualTarget}). " +
                            $"Office {office.OfficeId} has {office.AssignedTargetAnnual}.");
                    }
                    
                    // Validate quarterly targets match annual
                    if (office.AssignedTargetQ1.HasValue && Math.Abs(office.AssignedTargetQ1.Value - office.AssignedTargetAnnual) > 0.01m)
                        throw new ValidationException($"For Uniform behavior, Q1 target must equal assigned annual target ({office.AssignedTargetAnnual}). Office {office.OfficeId} has {office.AssignedTargetQ1}.");
                    if (office.AssignedTargetQ2.HasValue && Math.Abs(office.AssignedTargetQ2.Value - office.AssignedTargetAnnual) > 0.01m)
                        throw new ValidationException($"For Uniform behavior, Q2 target must equal assigned annual target ({office.AssignedTargetAnnual}). Office {office.OfficeId} has {office.AssignedTargetQ2}.");
                    if (office.AssignedTargetQ3.HasValue && Math.Abs(office.AssignedTargetQ3.Value - office.AssignedTargetAnnual) > 0.01m)
                        throw new ValidationException($"For Uniform behavior, Q3 target must equal assigned annual target ({office.AssignedTargetAnnual}). Office {office.OfficeId} has {office.AssignedTargetQ3}.");
                    if (office.AssignedTargetQ4.HasValue && Math.Abs(office.AssignedTargetQ4.Value - office.AssignedTargetAnnual) > 0.01m)
                        throw new ValidationException($"For Uniform behavior, Q4 target must equal assigned annual target ({office.AssignedTargetAnnual}). Office {office.OfficeId} has {office.AssignedTargetQ4}.");
                }
                break;

            case "maximum":
                foreach (var office in officeAssignments)
                {
                    if (office.AssignedTargetAnnual > agencyAnnualTarget)
                    {
                        throw new ValidationException(
                            $"KPI '{fyActiveKPI.Name}' has Maximum behavior. " +
                            $"No office target may exceed the agency annual target ({agencyAnnualTarget}). " +
                            $"Office {office.OfficeId} has {office.AssignedTargetAnnual}.");
                    }
                }
                break;

            case "minimum":
                foreach (var office in officeAssignments)
                {
                    if (office.AssignedTargetAnnual < agencyAnnualTarget)
                    {
                        throw new ValidationException(
                            $"KPI '{fyActiveKPI.Name}' has Minimum behavior. " +
                            $"No office target may be below the agency annual target ({agencyAnnualTarget}). " +
                            $"Office {office.OfficeId} has {office.AssignedTargetAnnual}.");
                    }
                }
                break;

            case "milestone":
                // Flexible - no strict validation
                // Event-based KPIs: "System Go-Live", "Certification Achieved", "Policy Approved"
                // Targets can vary by office based on their role/capacity
                break;

            default:
                // Unknown behavior - apply summation validation as conservative default
                if (cumulativeTotalAnnual > agencyAnnualTarget)
                {
                    var remainingTarget = agencyAnnualTarget - existingTotalAnnual;
                    throw new ValidationException(
                        $"KPI '{fyActiveKPI.Name}' (Unknown behavior: {distributionBehavior}): " +
                        $"Cumulative total assigned ({cumulativeTotalAnnual:F2}) exceeds agency annual target ({agencyAnnualTarget:F2}). " +
                        $"Maximum remaining: {remainingTarget:F2}.");
                }
                break;
        }
    }
}
