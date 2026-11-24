using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Commands.UpdateKPIsForDeliveryUnit;

public class UpdateKPIsForDeliveryUnitCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateKPIsForDeliveryUnitCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateKPIsForDeliveryUnitCommand request, CancellationToken cancellationToken)
    {
        // Group updates by KPIId
        var updatesByKpi = request.KPITargetUpdates.GroupBy(u => u.KPIId);

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            foreach (var kpiGroup in updatesByKpi)
            {
                var kpiId = kpiGroup.Key;
                var updatesForKpi = kpiGroup.ToList();

                // Fetch KPI
                var kpi = await unitOfWork.KPIRepository.GetByIdAsync(kpiId, cancellationToken: cancellationToken)
                    ?? throw new NotFoundException($"KPI with ID {kpiId} not found.");

                // Fetch all targets for the KPI
                var kpiTargets = await unitOfWork.KPITargetRepository.ToListAsync(
                    unitOfWork.KPITargetRepository.Query(t => t.KPIId == kpi.Id),
                    cancellationToken);

                // Verify that all provided targets for this KPI match the KPI's targets
                var providedTargetIds = updatesForKpi.Select(u => u.TargetId).ToHashSet();
                var kpiTargetIds = kpiTargets.Select(t => t.Id).ToHashSet();
                if (!providedTargetIds.SetEquals(kpiTargetIds))
                    throw new BadRequestException($"The provided targets for KPI {kpiId} must exactly match all targets for the KPI.");

                // Fetch all existing assignments for this Delivery Unit and the provided targets
                var existingAssignments = await unitOfWork.DUKPITargetAssignmentRepository.ToListAsync(
                    unitOfWork.DUKPITargetAssignmentRepository.Query(a => a.DeliveryUnitId == request.DeliveryUnitId && providedTargetIds.Contains(a.KPITargetId)),
                    cancellationToken);

                // Verify all assignments exist
                var missingTargets = providedTargetIds.Except(existingAssignments.Select(a => a.KPITargetId)).ToList();
                if (missingTargets.Count != 0)
                    throw new NotFoundException($"DU KPI Assignments not found for Delivery Unit {request.DeliveryUnitId} and targets: {string.Join(", ", missingTargets)}.");

                // Fetch total allocated values for each target
                var allocationSums = await unitOfWork.DUKPITargetAssignmentRepository.GetTotalAllocatedByKPITargetIdsAsync(providedTargetIds, cancellationToken);

                foreach (var update in updatesForKpi)
                {
                    var assignment = existingAssignments.First(a => a.KPITargetId == update.TargetId);
                    var kpiTarget = kpiTargets.First(t => t.Id == update.TargetId);

                    decimal allocatedValue = update.AllocatedTargetValue;

                    // TODO: Version 2 - IsTargetValueAllocable property removed
                    // if (!kpi.IsTargetValueAllocable)
                    // {
                    //     // Automatically set to the full KPI target value for better UX
                    //     allocatedValue = kpiTarget.TargetValue;
                    // }
                    // else
                    {
                        // Check remaining target value
                        var totalPreviouslyAllocated = allocationSums.GetValueOrDefault(update.TargetId, 0);
                        var existingTotalExcludingCurrent = totalPreviouslyAllocated - assignment.AllocatedTargetValue;
                        var newTotalAllocatedValue = existingTotalExcludingCurrent + allocatedValue;
                        if (newTotalAllocatedValue > kpiTarget.TargetValue)
                            throw new BadRequestException(
                                $"The requested allocation ({allocatedValue}) causes the total allocated value to exceed the KPI target's value of {kpiTarget.TargetValue}. Current total allocated: {existingTotalExcludingCurrent} for target {update.TargetId}.");
                    }

                    assignment.AllocatedTargetValue = allocatedValue;
                }
            }

            await unitOfWork.SaveChangesAsync(cancellationToken);
        }, cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "DU KPI Assignments updated successfully.");
    }
}