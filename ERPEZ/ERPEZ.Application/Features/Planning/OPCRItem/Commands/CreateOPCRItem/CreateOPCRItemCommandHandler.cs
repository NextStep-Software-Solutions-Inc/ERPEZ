using ERPEZ.Application.Common.Validators;
using ERPEZ.Application.Features.Planning.OPCRItem.Validators;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItem.Commands.CreateOPCRItem;

public class CreateOPCRItemCommandHandler(IUnitOfWork unitOfWork, IOPCRItemTargetValidator targetValidator)
    : IRequestHandler<CreateOPCRItemCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateOPCRItemCommand request, CancellationToken cancellationToken)
    {
        var opcrData = await unitOfWork.OPCRRepository.GetFirstAsync(
            unitOfWork.OPCRRepository.Query(o => o.Id == request.OPCRId)
                .Select(o => new { o.Id, o.OfficeId, o.FiscalYearId }),
            cancellationToken) ?? throw new NotFoundException("OPCR not found.");

        var assignmentData = await unitOfWork.KPIAssignmentRepository.GetFirstAsync(
            unitOfWork.KPIAssignmentRepository.Query(a => a.Id == request.KPIAssignmentId)
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

        var existingItem = await unitOfWork.OPCRItemRepository.FindAsync(
            i => i.OPCRId == request.OPCRId && i.KPIAssignmentId == request.KPIAssignmentId,
            cancellationToken);

        if (existingItem != null)
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

        var q1 = request.Q1Target ?? 0;
        var q2 = request.Q2Target ?? 0;
        var q3 = request.Q3Target ?? 0;
        var q4 = request.Q4Target ?? 0;

        if (!request.IsShopped && hasAssignedQuarterlyTargets)
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
            request.IsShopped,
            assignmentData.AssignedTargetAnnual,
            assignmentData.AssignedTargetQ1,
            assignmentData.AssignedTargetQ2,
            assignmentData.AssignedTargetQ3,
            assignmentData.AssignedTargetQ4,
            q1,
            q2,
            q3,
            q4);

        var opcrItem = new Domain.Entities.Planning.OPCRItem
        {
            Id = Guid.NewGuid(),
            OPCRId = request.OPCRId,
            KPIAssignmentId = request.KPIAssignmentId,
            IsShopped = request.IsShopped,
            Q1Target = q1,
            Q2Target = q2,
            Q3Target = q3,
            Q4Target = q4,
            CreatedAt = DateTime.UtcNow
        };

        await unitOfWork.OPCRItemRepository.AddAsync(opcrItem, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(opcrItem.Id, "OPCR Item created successfully.");
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
