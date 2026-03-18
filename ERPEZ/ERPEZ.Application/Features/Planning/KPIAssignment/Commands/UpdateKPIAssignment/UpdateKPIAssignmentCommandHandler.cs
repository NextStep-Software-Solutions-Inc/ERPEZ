using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Commands.UpdateKPIAssignment;

public class UpdateKPIAssignmentCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateKPIAssignmentCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateKPIAssignmentCommand request, CancellationToken cancellationToken)
    {
        var assignment = await unitOfWork.KPIAssignmentRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI Assignment not found.");

        // Get FYActiveKPI to check distribution behavior
        var fyActiveKpi = await unitOfWork.FYActiveKPIRepository.GetByIdAsync(assignment.FYActiveKPIId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("FY Active KPI not found.");

        if (fyActiveKpi.Status != "TargetsSet")
        {
            throw new ValidationException(
                $"Cannot update assignment for KPI '{fyActiveKpi.Name}'. " +
                $"Targets must be set first (Current Status: {fyActiveKpi.Status}).");
        }

        if (!Enum.TryParse<DistributionBehaviorEnum>(fyActiveKpi.DistributionBehavior, true, out var distributionBehavior))
            throw new ValidationException($"Invalid DistributionBehavior: {fyActiveKpi.DistributionBehavior}");

        if (!Enum.TryParse<MeasurementUnitEnum>(fyActiveKpi.MeasurementUnit, true, out var measurementUnit))
            throw new ValidationException($"Invalid MeasurementUnit: {fyActiveKpi.MeasurementUnit}");

        if (measurementUnit == MeasurementUnitEnum.Percentage)
        {
            if (request.AssignedTargetAnnual > 100)
                throw new ValidationException("Assigned annual percentage target cannot exceed 100%.");
            if (request.AssignedTargetQ1.HasValue && request.AssignedTargetQ1.Value > 100)
                throw new ValidationException("Q1 percentage target cannot exceed 100%.");
            if (request.AssignedTargetQ2.HasValue && request.AssignedTargetQ2.Value > 100)
                throw new ValidationException("Q2 percentage target cannot exceed 100%.");
            if (request.AssignedTargetQ3.HasValue && request.AssignedTargetQ3.Value > 100)
                throw new ValidationException("Q3 percentage target cannot exceed 100%.");
            if (request.AssignedTargetQ4.HasValue && request.AssignedTargetQ4.Value > 100)
                throw new ValidationException("Q4 percentage target cannot exceed 100%.");
        }

        // Get all other assignments for cumulative checks
        var otherAssignments = await unitOfWork.KPIAssignmentRepository
            .Query(a => a.FYActiveKPIId == assignment.FYActiveKPIId && a.Id != request.Id)
            .ToListAsync(cancellationToken);

        var otherTotalAnnual = otherAssignments.Sum(a => a.AssignedTargetAnnual);
        var cumulativeTotalAnnual = otherTotalAnnual + request.AssignedTargetAnnual;

        switch (distributionBehavior)
        {
            case DistributionBehaviorEnum.Summation:
                if (cumulativeTotalAnnual > fyActiveKpi.AgencyTargetAnnual)
                {
                    var remaining = fyActiveKpi.AgencyTargetAnnual - otherTotalAnnual;
                    throw new BadRequestException(
                        $"KPI '{fyActiveKpi.Name}' has Summation behavior. " +
                        $"Total assigned ({cumulativeTotalAnnual:F2}) exceeds agency annual target ({fyActiveKpi.AgencyTargetAnnual:F2}). " +
                        $"Maximum remaining: {remaining:F2}.");
                }
                break;

            case DistributionBehaviorEnum.Uniform:
                if (Math.Abs(request.AssignedTargetAnnual - fyActiveKpi.AgencyTargetAnnual) > 0.01m)
                {
                    throw new BadRequestException(
                        $"KPI '{fyActiveKpi.Name}' has Uniform behavior. " +
                        $"Each office must receive the exact agency annual target ({fyActiveKpi.AgencyTargetAnnual}).");
                }
                
                // For Uniform, each provided quarterly target must equal the assigned annual target
                if (request.AssignedTargetQ1.HasValue && Math.Abs(request.AssignedTargetQ1.Value - request.AssignedTargetAnnual) > 0.01m)
                    throw new BadRequestException($"For Uniform behavior, Q1 target must equal assigned annual target ({request.AssignedTargetAnnual}).");
                if (request.AssignedTargetQ2.HasValue && Math.Abs(request.AssignedTargetQ2.Value - request.AssignedTargetAnnual) > 0.01m)
                    throw new BadRequestException($"For Uniform behavior, Q2 target must equal assigned annual target ({request.AssignedTargetAnnual}).");
                if (request.AssignedTargetQ3.HasValue && Math.Abs(request.AssignedTargetQ3.Value - request.AssignedTargetAnnual) > 0.01m)
                    throw new BadRequestException($"For Uniform behavior, Q3 target must equal assigned annual target ({request.AssignedTargetAnnual}).");
                if (request.AssignedTargetQ4.HasValue && Math.Abs(request.AssignedTargetQ4.Value - request.AssignedTargetAnnual) > 0.01m)
                    throw new BadRequestException($"For Uniform behavior, Q4 target must equal assigned annual target ({request.AssignedTargetAnnual}).");
                break;

            case DistributionBehaviorEnum.Maximum:
                if (request.AssignedTargetAnnual > fyActiveKpi.AgencyTargetAnnual)
                {
                    throw new BadRequestException(
                        $"KPI '{fyActiveKpi.Name}' has Maximum behavior. " +
                        $"No office target may exceed the agency annual target ({fyActiveKpi.AgencyTargetAnnual}).");
                }
                break;

            case DistributionBehaviorEnum.Minimum:
                if (request.AssignedTargetAnnual < fyActiveKpi.AgencyTargetAnnual)
                {
                    throw new BadRequestException(
                        $"KPI '{fyActiveKpi.Name}' has Minimum behavior. " +
                        $"No office target may be below the agency annual target ({fyActiveKpi.AgencyTargetAnnual}).");
                }
                break;

            case DistributionBehaviorEnum.Milestone:
                break;
        }

        assignment.AssignedTargetAnnual = request.AssignedTargetAnnual;
        assignment.AssignedTargetQ1 = request.AssignedTargetQ1;
        assignment.AssignedTargetQ2 = request.AssignedTargetQ2;
        assignment.AssignedTargetQ3 = request.AssignedTargetQ3;
        assignment.AssignedTargetQ4 = request.AssignedTargetQ4;
        assignment.IsLocked = request.IsLocked;

        unitOfWork.KPIAssignmentRepository.Update(assignment);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "KPI Assignment updated successfully.");
    }
}
