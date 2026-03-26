using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Commands.SetTargets;

/// <summary>
/// Bulk update agency targets for activated KPIs.
/// Sets status to "TargetsSet" for KPIs that receive targets.
/// </summary>
public class SetFYActiveKPITargetsCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<SetFYActiveKPITargetsCommand, ApiResponse<int>>
{
    public async Task<ApiResponse<int>> Handle(SetFYActiveKPITargetsCommand request, CancellationToken cancellationToken)
    {
        if (request.Targets == null || request.Targets.Count == 0)
            throw new ValidationException("At least one KPI target must be provided.");

        int updatedCount = 0;
        Guid? fiscalYearId = null;

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            foreach (var targetRequest in request.Targets)
            {
                var fyActiveKPI = await unitOfWork.FYActiveKPIRepository.GetByIdAsync(targetRequest.FYActiveKPIId, cancellationToken: cancellationToken)
                    ?? throw new NotFoundException($"FYActiveKPI with ID {targetRequest.FYActiveKPIId} not found.");

                // Set fiscal year from first KPI, then validate all subsequent KPIs belong to the same fiscal year
                if (fiscalYearId == null)
                {
                    fiscalYearId = fyActiveKPI.FiscalYearId;
                }
                else if (fyActiveKPI.FiscalYearId != fiscalYearId)
                {
                    throw new ValidationException($"All KPIs in the batch must belong to the same fiscal year. KPI '{fyActiveKPI.Name}' belongs to a different fiscal year.");
                }

                // Prevent updating if the fiscal year is locked
                if (fyActiveKPI.IsLocked)
                    throw new ConflictException($"Cannot update targets for KPI '{fyActiveKPI.Name}' - the fiscal year KPIs are locked.");

                // Prevent updating if already assigned to offices (query directly — nav prop not loaded by GetByIdAsync)
                var hasAssignment = await unitOfWork.KPIAssignmentRepository.FindAsync(
                    a => a.FYActiveKPIId == targetRequest.FYActiveKPIId, cancellationToken);
                if (hasAssignment != null)
                    throw new ConflictException($"Cannot update targets for KPI '{fyActiveKPI.Name}' - it has already been assigned to offices.");

                // Validate quarterly targets based on Distribution Behavior
                ValidateQuarterlyTargets(fyActiveKPI, targetRequest);

                // Update targets
                fyActiveKPI.AgencyTargetAnnual = targetRequest.AgencyTargetAnnual;
                fyActiveKPI.AgencyTargetQ1 = targetRequest.AgencyTargetQ1;
                fyActiveKPI.AgencyTargetQ2 = targetRequest.AgencyTargetQ2;
                fyActiveKPI.AgencyTargetQ3 = targetRequest.AgencyTargetQ3;
                fyActiveKPI.AgencyTargetQ4 = targetRequest.AgencyTargetQ4;
                fyActiveKPI.Status = "TargetsSet";

                unitOfWork.FYActiveKPIRepository.Update(fyActiveKPI);
                updatedCount++;
            }

            await unitOfWork.SaveChangesAsync(cancellationToken);
        }, cancellationToken);

        return ApiResponse<int>.Success(updatedCount, $"{updatedCount} KPI target(s) updated successfully.");
    }

    private void ValidateQuarterlyTargets(Domain.Entities.Planning.FYActiveKPI fyActiveKPI, Dtos.SetTargetRequest targetRequest)
    {
        // If no quarterly targets provided, skip validation
        if (!targetRequest.AgencyTargetQ1.HasValue && 
            !targetRequest.AgencyTargetQ2.HasValue && 
            !targetRequest.AgencyTargetQ3.HasValue && 
            !targetRequest.AgencyTargetQ4.HasValue)
        {
            return;
        }

        // Validate all provided quarterly targets are non-negative
        if ((targetRequest.AgencyTargetQ1.HasValue && targetRequest.AgencyTargetQ1.Value < 0) ||
            (targetRequest.AgencyTargetQ2.HasValue && targetRequest.AgencyTargetQ2.Value < 0) ||
            (targetRequest.AgencyTargetQ3.HasValue && targetRequest.AgencyTargetQ3.Value < 0) ||
            (targetRequest.AgencyTargetQ4.HasValue && targetRequest.AgencyTargetQ4.Value < 0))
        {
            throw new ValidationException($"KPI '{fyActiveKPI.Name}': Quarterly targets must be greater than or equal to 0.");
        }

        // Get provided quarterly values (treat null as 0 for calculation)
        var providedQuarters = new List<decimal>();
        if (targetRequest.AgencyTargetQ1.HasValue) providedQuarters.Add(targetRequest.AgencyTargetQ1.Value);
        if (targetRequest.AgencyTargetQ2.HasValue) providedQuarters.Add(targetRequest.AgencyTargetQ2.Value);
        if (targetRequest.AgencyTargetQ3.HasValue) providedQuarters.Add(targetRequest.AgencyTargetQ3.Value);
        if (targetRequest.AgencyTargetQ4.HasValue) providedQuarters.Add(targetRequest.AgencyTargetQ4.Value);

        var annual = targetRequest.AgencyTargetAnnual;
        var distributionBehavior = fyActiveKPI.DistributionBehavior?.ToLower();

        // Only validate if user provided specific quarterly targets
        // User has flexibility to set targets for any quarters they choose
        switch (distributionBehavior)
        {
            case "summation":
                // Sum of PROVIDED quarterly targets should not exceed annual
                var quarterlySum = providedQuarters.Sum();
                if (quarterlySum > annual)
                {
                    throw new ValidationException(
                        $"KPI '{fyActiveKPI.Name}' has Summation behavior. " +
                        $"Sum of provided quarterly targets ({quarterlySum}) cannot exceed the annual target ({annual}).");
                }
                break;

            case "maximum":
                // No provided quarterly target should exceed annual target
                var quarterlyMax = providedQuarters.Any() ? providedQuarters.Max() : 0;
                if (quarterlyMax > annual)
                {
                    throw new ValidationException(
                        $"KPI '{fyActiveKPI.Name}' has Maximum behavior. " +
                        $"No quarterly target may exceed the annual target ({annual}).");
                }
                break;

            case "minimum":
                // No provided quarterly target should be below annual target
                var quarterlyMin = providedQuarters.Any() ? providedQuarters.Min() : annual;
                if (quarterlyMin < annual)
                {
                    throw new ValidationException(
                        $"KPI '{fyActiveKPI.Name}' has Minimum behavior. " +
                        $"No quarterly target may be below the annual target ({annual}).");
                }
                break;

            case "uniform":
                // For Uniform behavior, each provided quarterly target must match annual target.
                foreach (var quarter in providedQuarters)
                {
                    if (Math.Abs(quarter - annual) > 0.01m)
                    {
                        throw new ValidationException(
                            $"KPI '{fyActiveKPI.Name}' has Uniform behavior. " +
                            $"Each provided quarterly target must equal the annual target ({annual}).");
                    }
                }
                break;

            case "milestone":
                // For Milestone behavior, quarterly targets are flexible
                break;

            default:
                // Unknown behavior - apply summation validation as conservative default
                var defaultSum = providedQuarters.Sum();
                if (defaultSum > annual)
                {
                    throw new ValidationException(
                        $"KPI '{fyActiveKPI.Name}': Sum of provided quarterly targets ({defaultSum}) cannot exceed the annual target ({annual}).");
                }
                break;
        }
    }
}
