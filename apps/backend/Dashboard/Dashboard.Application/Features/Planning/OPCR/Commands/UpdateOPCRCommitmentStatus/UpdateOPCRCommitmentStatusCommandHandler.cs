using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCR.Commands.UpdateOPCRCommitmentStatus;

public class UpdateOPCRCommitmentStatusCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateOPCRCommitmentStatusCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        UpdateOPCRCommitmentStatusCommand request, CancellationToken cancellationToken)
    {
        var opcr = await unitOfWork.OPCRRepository.GetOPCRWithDetailsAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("OPCR not found.");

        var newStatus = request.Request.CommitmentStatus;

        if (newStatus.Equals("Submitted", StringComparison.OrdinalIgnoreCase))
        {
            if (opcr.CommitmentStatus.Equals("Approved", StringComparison.OrdinalIgnoreCase))
            {
                throw new ValidationException("Cannot submit an OPCR with status 'Approved'.");
            }

            ValidateOPCRForSubmission(opcr);
            opcr.SubmittedDate = DateTime.UtcNow;
            opcr.CommitmentStatus = "Submitted";
        }
        else if (newStatus.Equals("Approved", StringComparison.OrdinalIgnoreCase))
        {
            if (!opcr.CommitmentStatus.Equals("Submitted", StringComparison.OrdinalIgnoreCase))
            {
                throw new ValidationException(
                    $"Cannot approve OPCR with status '{opcr.CommitmentStatus}'. Only Submitted OPCRs can be approved.");
            }

            opcr.ApprovedDate = DateTime.UtcNow;
            opcr.CommitmentStatus = "Approved";
        }
        else if (newStatus.Equals("Returned", StringComparison.OrdinalIgnoreCase))
        {
            if (!opcr.CommitmentStatus.Equals("Submitted", StringComparison.OrdinalIgnoreCase))
            {
                throw new ValidationException(
                    $"Cannot return OPCR with status '{opcr.CommitmentStatus}'. Only Submitted OPCRs can be returned.");
            }

            opcr.ApprovedDate = null;
            opcr.CommitmentStatus = "Returned";
        }
        else if (newStatus.Equals("Draft", StringComparison.OrdinalIgnoreCase))
        {
            opcr.CommitmentStatus = "Draft";
            opcr.SubmittedDate = null;
            opcr.ApprovedDate = null;
        }
        else
        {
            opcr.CommitmentStatus = newStatus;
        }

        unitOfWork.OPCRRepository.Update(opcr);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Commitment status updated successfully.");
    }

    private static void ValidateOPCRForSubmission(Domain.Entities.Planning.OPCR opcr)
    {
        var activeItems = opcr.OPCRItems?.Where(i => !i.IsDeleted).ToList() ?? [];
        if (activeItems.Count == 0)
        {
            throw new ValidationException("Cannot submit OPCR for approval without assigned KPIs.");
        }

        var totalActivities = activeItems.Sum(i => i.OPCRActivities?.Count(a => !a.IsDeleted) ?? 0);
        if (totalActivities == 0)
        {
            throw new ValidationException("Cannot submit OPCR for approval without adding at least one activity.");
        }

        var itemsWithoutActivities = activeItems
            .Where(i => i.OPCRActivities == null || !i.OPCRActivities.Any(a => !a.IsDeleted))
            .ToList();

        if (itemsWithoutActivities.Count > 0)
        {
            var kpiNames = string.Join(", ", itemsWithoutActivities
                .Select(i => i.KPIAssignment?.FYActiveKPI?.Name ?? "Assigned KPI"));
            throw new ValidationException(
                $"Cannot submit OPCR for approval when assigned KPI(s) have no activities: {kpiNames}. Please add at least one activity to each KPI.");
        }

        var itemsWithoutTargets = activeItems.Where(i =>
        {
            var itemQuarterSum = i.Q1Target + i.Q2Target + i.Q3Target + i.Q4Target;
            var assignedQuarterSum = 0m;
            if (i.KPIAssignment != null)
            {
                assignedQuarterSum = (i.KPIAssignment.AssignedTargetQ1 ?? 0)
                    + (i.KPIAssignment.AssignedTargetQ2 ?? 0)
                    + (i.KPIAssignment.AssignedTargetQ3 ?? 0)
                    + (i.KPIAssignment.AssignedTargetQ4 ?? 0);
            }

            return Math.Max(itemQuarterSum, assignedQuarterSum) <= 0;
        }).ToList();

        if (itemsWithoutTargets.Count > 0)
        {
            var kpiNames = string.Join(", ", itemsWithoutTargets
                .Select(i => i.KPIAssignment?.FYActiveKPI?.Name ?? "Assigned KPI"));
            throw new ValidationException(
                $"Cannot submit OPCR for approval when assigned KPI(s) have no quarterly targets configured: {kpiNames}. Please set quarterly targets first.");
        }
    }
}
