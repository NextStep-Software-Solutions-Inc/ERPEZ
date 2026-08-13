using ERPEZ.Application.Common.Validators;
using ERPEZ.Application.Features.Planning.OPCRItem.Validators;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItem.Commands.UpdateOPCRItem;

public class UpdateOPCRItemCommandHandler(IUnitOfWork unitOfWork, IOPCRItemTargetValidator targetValidator)
    : IRequestHandler<UpdateOPCRItemCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateOPCRItemCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateOPCRItem;
        var opcrItem = await unitOfWork.OPCRItemRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("OPCR Item not found.");

        var opcrId = dto.OPCRId ?? opcrItem.OPCRId;
        var kpiAssignmentId = dto.KPIAssignmentId ?? opcrItem.KPIAssignmentId;
        var isShopped = dto.IsShopped ?? opcrItem.IsShopped;

        var opcrData = await unitOfWork.OPCRRepository.GetFirstAsync(
            unitOfWork.OPCRRepository.Query(o => o.Id == opcrId)
                .Select(o => new { o.Id, o.OfficeId, o.FiscalYearId }),
            cancellationToken) ?? throw new NotFoundException("OPCR not found.");

        var assignmentData = await unitOfWork.KPIAssignmentRepository.GetFirstAsync(
            unitOfWork.KPIAssignmentRepository.Query(a => a.Id == kpiAssignmentId)
                .Select(a => new
                {
                    a.Id,
                    a.OfficeId,
                    a.AssignedTargetAnnual,
                    a.AssignedTargetQ1,
                    a.AssignedTargetQ2,
                    a.AssignedTargetQ3,
                    a.AssignedTargetQ4,
                    a.IsLocked,
                    FiscalYearId = a.FYActiveKPI != null ? a.FYActiveKPI.FiscalYearId : Guid.Empty,
                    DistributionBehavior = a.FYActiveKPI != null ? a.FYActiveKPI.DistributionBehavior : string.Empty,
                    KPIName = a.FYActiveKPI != null ? a.FYActiveKPI.Name : string.Empty
                }),
            cancellationToken) ?? throw new NotFoundException("KPI Assignment not found.");

        if (assignmentData.OfficeId != opcrData.OfficeId)
        {
            throw new ValidationException("KPI Assignment is not assigned/shopped to the OPCR office.");
        }

        if (assignmentData.FiscalYearId != opcrData.FiscalYearId)
        {
            throw new ValidationException("KPI Assignment fiscal year does not match OPCR fiscal year.");
        }

        var duplicateItem = await unitOfWork.OPCRItemRepository.FindAsync(
            i => i.Id != request.Id && i.OPCRId == opcrId && i.KPIAssignmentId == kpiAssignmentId,
            cancellationToken);

        if (duplicateItem != null)
        {
            throw new ConflictException("This KPI Assignment already exists in the OPCR items.");
        }

        if (!ValidationUtilities.TryParseDistributionBehavior(assignmentData.DistributionBehavior, out var distributionBehavior))
        {
            throw new ValidationException(
                $"Invalid DistributionBehavior for KPI '{assignmentData.KPIName}'. " +
                $"Received '{assignmentData.DistributionBehavior}'. " +
            $"Normalized value: '{ValidationUtilities.NormalizeDistributionBehavior(assignmentData.DistributionBehavior)}'. " +
            $"Accepted values: {ValidationUtilities.GetDistributionBehaviorOptions()}.");
        }

        var hasAssignedQuarterlyTargets = assignmentData.AssignedTargetQ1.HasValue
            || assignmentData.AssignedTargetQ2.HasValue
            || assignmentData.AssignedTargetQ3.HasValue
            || assignmentData.AssignedTargetQ4.HasValue;

        var q1 = dto.Q1Target ?? opcrItem.Q1Target;
        var q2 = dto.Q2Target ?? opcrItem.Q2Target;
        var q3 = dto.Q3Target ?? opcrItem.Q3Target;
        var q4 = dto.Q4Target ?? opcrItem.Q4Target;

        if (!isShopped && hasAssignedQuarterlyTargets)
        {
            q1 = ConvertAssignedQuarterTarget(assignmentData.AssignedTargetQ1, "Q1", assignmentData.KPIName);
            q2 = ConvertAssignedQuarterTarget(assignmentData.AssignedTargetQ2, "Q2", assignmentData.KPIName);
            q3 = ConvertAssignedQuarterTarget(assignmentData.AssignedTargetQ3, "Q3", assignmentData.KPIName);
            q4 = ConvertAssignedQuarterTarget(assignmentData.AssignedTargetQ4, "Q4", assignmentData.KPIName);
        }

        targetValidator.Validate(
            assignmentData.KPIName,
            distributionBehavior,
            assignmentData.IsLocked,
            isShopped,
            assignmentData.AssignedTargetAnnual,
            assignmentData.AssignedTargetQ1,
            assignmentData.AssignedTargetQ2,
            assignmentData.AssignedTargetQ3,
            assignmentData.AssignedTargetQ4,
            q1,
            q2,
            q3,
            q4);

        opcrItem.OPCRId = opcrId;
        opcrItem.KPIAssignmentId = kpiAssignmentId;
        opcrItem.IsShopped = isShopped;
        opcrItem.Q1Target = q1;
        opcrItem.Q2Target = q2;
        opcrItem.Q3Target = q3;
        opcrItem.Q4Target = q4;

        unitOfWork.OPCRItemRepository.Update(opcrItem);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "OPCR Item updated successfully.");
    }

    private static int ConvertAssignedQuarterTarget(decimal? assignedQuarterTarget, string quarterName, string kpiName)
    {
        if (!assignedQuarterTarget.HasValue)
        {
            return 0;
        }

        if (assignedQuarterTarget.Value % 1 != 0)
        {
            throw new ValidationException(
                $"KPI '{kpiName}' has non-integer assigned {quarterName} target ({assignedQuarterTarget.Value}). OPCR Item quarterly targets only support whole numbers.");
        }

        return checked((int)assignedQuarterTarget.Value);
    }
}
