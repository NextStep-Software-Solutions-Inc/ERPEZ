using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Commands.BulkUpdateKPIAssignmentLockStatus;

public class BulkUpdateKPIAssignmentLockStatusCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<BulkUpdateKPIAssignmentLockStatusCommand, ApiResponse<BulkLockStatusUpdateResult>>
{
    public async Task<ApiResponse<BulkLockStatusUpdateResult>> Handle(
        BulkUpdateKPIAssignmentLockStatusCommand request,
        CancellationToken cancellationToken)
    {
        var updatedAssignmentIds = new List<Guid>();
        int totalKPIsProcessed = 0;
        int totalAssignmentsUpdated = 0;

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            foreach (var item in request.Assignments)
            {
                var fyActiveKPI = await unitOfWork.FYActiveKPIRepository.GetByIdAsync(item.FYActiveKPIId, cancellationToken: cancellationToken)
                    ?? throw new NotFoundException($"FYActiveKPI with ID {item.FYActiveKPIId} not found.");

                if (fyActiveKPI.Status != "TargetsSet")
                {
                    throw new ValidationException(
                        $"Cannot update lock status for KPI '{fyActiveKPI.Name}'. " +
                        $"Targets must be set first (Current Status: {fyActiveKPI.Status}).");
                }

                var officeIds = item.OfficeAssignments.Select(x => x.OfficeId).ToList();
                if (officeIds.Count != officeIds.Distinct().Count())
                {
                    throw new ValidationException($"KPI '{fyActiveKPI.Name}' contains duplicate office lock updates.");
                }

                var assignments = await unitOfWork.KPIAssignmentRepository.ToListAsync(
                    unitOfWork.KPIAssignmentRepository.Query(a =>
                        a.FYActiveKPIId == item.FYActiveKPIId &&
                        officeIds.Contains(a.OfficeId) &&
                        !a.IsDeleted),
                    cancellationToken);

                if (assignments.Count != officeIds.Count)
                {
                    var missingOfficeIds = officeIds.Except(assignments.Select(a => a.OfficeId)).ToList();
                    throw new NotFoundException(
                        $"KPI '{fyActiveKPI.Name}' is not assigned to office(s): {string.Join(", ", missingOfficeIds)}.");
                }

                var officeStatusMap = item.OfficeAssignments
                    .ToDictionary(x => x.OfficeId, x => x.IsLocked);

                foreach (var assignment in assignments)
                {
                    assignment.IsLocked = officeStatusMap[assignment.OfficeId];
                    unitOfWork.KPIAssignmentRepository.Update(assignment);
                    updatedAssignmentIds.Add(assignment.Id);
                    totalAssignmentsUpdated++;
                }

                totalKPIsProcessed++;
            }

            await unitOfWork.SaveChangesAsync(cancellationToken);
        }, cancellationToken);

        var result = new BulkLockStatusUpdateResult
        {
            TotalKPIsProcessed = totalKPIsProcessed,
            TotalAssignmentsUpdated = totalAssignmentsUpdated,
            UpdatedAssignmentIds = updatedAssignmentIds
        };

        return ApiResponse<BulkLockStatusUpdateResult>.Success(
            result,
            $"Successfully updated lock status for {totalAssignmentsUpdated} assignment(s) across {totalKPIsProcessed} KPI(s).");
    }
}
