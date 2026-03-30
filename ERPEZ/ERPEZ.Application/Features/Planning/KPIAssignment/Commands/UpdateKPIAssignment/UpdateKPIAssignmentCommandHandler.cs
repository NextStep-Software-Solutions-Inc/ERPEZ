using ERPEZ.Application.Features.Planning.KPIAssignment.Validators;
using ERPEZ.Application.Common.Validators;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Commands.UpdateKPIAssignment;

public class UpdateKPIAssignmentCommandHandler(IUnitOfWork unitOfWork, IKPIAssignmentBehaviorValidator behaviorValidator)
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

        if (!ValidationUtilities.TryParseDistributionBehavior(fyActiveKpi.DistributionBehavior, out var distributionBehavior))
            throw new ValidationException(
                $"Invalid DistributionBehavior for KPI '{fyActiveKpi.Name}'. " +
                $"Received '{fyActiveKpi.DistributionBehavior}'. " +
                $"Normalized value: '{ValidationUtilities.NormalizeDistributionBehavior(fyActiveKpi.DistributionBehavior)}'. " +
                $"Accepted values: {ValidationUtilities.GetDistributionBehaviorOptions()}.");

        if (!Enum.TryParse<MeasurementUnitEnum>(fyActiveKpi.MeasurementUnit, true, out var measurementUnit))
            throw new ValidationException($"Invalid MeasurementUnit: {fyActiveKpi.MeasurementUnit}");

        if (measurementUnit == MeasurementUnitEnum.Percentage)
        {
            behaviorValidator.ValidatePercentageMeasurement(
                fyActiveKpi.Name,
                request.AssignedTargetAnnual,
                request.AssignedTargetQ1,
                request.AssignedTargetQ2,
                request.AssignedTargetQ3,
                request.AssignedTargetQ4);
        }

        // Get all other assignments for cumulative checks
        var otherAssignments = await unitOfWork.KPIAssignmentRepository.ToListAsync(
            unitOfWork.KPIAssignmentRepository.Query(
                a => a.FYActiveKPIId == assignment.FYActiveKPIId && a.Id != request.Id),
            cancellationToken);

        var otherTotalAnnual = otherAssignments.Sum(a => a.AssignedTargetAnnual);
        var cumulativeTotalAnnual = otherTotalAnnual + request.AssignedTargetAnnual;

        try
        {
            switch (distributionBehavior)
            {
                case DistributionBehaviorEnum.Summation:
                    behaviorValidator.ValidateSummation(
                        fyActiveKpi.Name,
                        fyActiveKpi.AgencyTargetAnnual,
                        cumulativeTotalAnnual,
                        otherTotalAnnual,
                        request.AssignedTargetAnnual);
                    break;

                case DistributionBehaviorEnum.Uniform:
                    behaviorValidator.ValidateUniform(fyActiveKpi.Name, fyActiveKpi.AgencyTargetAnnual, request.AssignedTargetAnnual);
                    behaviorValidator.ValidateUniformQuarterly(
                        fyActiveKpi.Name,
                        request.AssignedTargetAnnual,
                        request.AssignedTargetQ1,
                        request.AssignedTargetQ2,
                        request.AssignedTargetQ3,
                        request.AssignedTargetQ4);
                    break;

                case DistributionBehaviorEnum.Maximum:
                    behaviorValidator.ValidateMaximum(fyActiveKpi.Name, fyActiveKpi.AgencyTargetAnnual, request.AssignedTargetAnnual);
                    break;

                case DistributionBehaviorEnum.Minimum:
                    behaviorValidator.ValidateMinimum(fyActiveKpi.Name, fyActiveKpi.AgencyTargetAnnual, request.AssignedTargetAnnual);
                    break;

                case DistributionBehaviorEnum.Milestone:
                    break;
            }
        }
        catch (ValidationException ex)
        {
            // Re-throw as BadRequestException for consistency with update semantics
            throw new BadRequestException(ex.Message);
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
