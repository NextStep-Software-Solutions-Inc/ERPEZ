using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Commands.UpdateDUKPIAssignment;

public class UpdateDUKPIAssignmentCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateDUKPIAssignmentCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateDUKPIAssignmentCommand request, CancellationToken cancellationToken)
    {
        var targetIds = request.UpdateDUKPIAssignments.Select(u => u.TargetId).ToHashSet();

        // Pre-fetch all assignments for the Delivery Unit and provided targets
        var assignments = await unitOfWork.DUKPIAssignmentRepository.ToListAsync(
            unitOfWork.DUKPIAssignmentRepository.Query(a => a.DeliveryUnitId == request.Id && targetIds.Contains(a.KPITargetId)),
            cancellationToken);

        // Verify all required assignments exist
        var missingTargets = targetIds.Except(assignments.Select(a => a.KPITargetId)).ToList();
        if (missingTargets.Count != 0)
            throw new NotFoundException($"DU KPI Assignments not found for Delivery Unit {request.Id} and targets: {string.Join(", ", missingTargets)}.");

        // Pre-fetch KPIs
        var kpiIds = assignments.Select(a => a.KPIId).Distinct().ToList();
        var kpisList = await unitOfWork.KPIRepository.ToListAsync(
            unitOfWork.KPIRepository.Query(k => kpiIds.Contains(k.Id)),
            cancellationToken);
        var kpis = kpisList.ToDictionary(k => k.Id);

        // Pre-fetch KPI Targets
        var kpiTargetsList = await unitOfWork.KPITargetRepository.ToListAsync(
            unitOfWork.KPITargetRepository.Query(t => targetIds.Contains(t.Id)),
            cancellationToken);
        var kpiTargets = kpiTargetsList.ToDictionary(t => t.Id);

        // Pre-fetch total allocated values for each target
        var allocationAssignments = await unitOfWork.DUKPIAssignmentRepository.ToListAsync(
            unitOfWork.DUKPIAssignmentRepository.Query(a => targetIds.Contains(a.KPITargetId)),
            cancellationToken);
        var allocationSums = allocationAssignments
            .GroupBy(a => a.KPITargetId)
            .ToDictionary(g => g.Key, g => g.Sum(a => a.AllocatedTargetValue));

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            foreach (var update in request.UpdateDUKPIAssignments)
            {
                var assignment = assignments.First(a => a.KPITargetId == update.TargetId);
                var kpi = kpis[assignment.KPIId];
                var kPITarget = kpiTargets[update.TargetId];

                decimal allocatedValue = update.AllocatedTargetValue;

                if (!kpi.IsTargetValueAllocable)
                {
                    // Automatically set to the full KPI target value for better UX
                    allocatedValue = kPITarget.TargetValue;
                }
                else
                {
                    // Calculate existing total excluding current assignment
                    var totalAllocatedForTarget = allocationSums.GetValueOrDefault(update.TargetId, 0);
                    var existingTotalExcludingCurrent = totalAllocatedForTarget - assignment.AllocatedTargetValue;
                    var newTotalAllocatedValue = existingTotalExcludingCurrent + allocatedValue;
                    if (newTotalAllocatedValue > kPITarget.TargetValue)
                        throw new BadRequestException($"The total allocated value ({newTotalAllocatedValue}) exceeds the KPI's overall target value of {kPITarget.TargetValue}. Please reduce the allocation.");
                }

                assignment.AllocatedTargetValue = allocatedValue;
            }

            await unitOfWork.SaveChangesAsync(cancellationToken);
        }, cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "DU KPI Assignments updated successfully.");
    }
}
