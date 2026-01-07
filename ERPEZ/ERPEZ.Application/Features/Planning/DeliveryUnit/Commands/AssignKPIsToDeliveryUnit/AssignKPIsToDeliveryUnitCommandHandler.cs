using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Commands.AssignKPIsToDeliveryUnit;

public class AssignKPIsToDeliveryUnitCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<AssignKPIsToDeliveryUnitCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(AssignKPIsToDeliveryUnitCommand request, CancellationToken cancellationToken)
    {
        // Group targets by KPIId
        var targetsByKpi = request.KPITargets.GroupBy(t => t.KPIId);

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            foreach (var kpiGroup in targetsByKpi)
            {
                var kpiId = kpiGroup.Key;
                var targetsForKpi = kpiGroup.ToList();

                // Fetch KPI
                var kpi = await unitOfWork.KPIRepository.GetByIdAsync(kpiId, cancellationToken: cancellationToken)
                    ?? throw new NotFoundException($"KPI with ID {kpiId} not found.");

                // Fetch all targets for the KPI
                var kpiTargets = await unitOfWork.KPITargetRepository.ToListAsync(
                    unitOfWork.KPITargetRepository.Query(t => t.KPIId == kpi.Id),
                    cancellationToken);

                // Verify that all provided targets for this KPI match the KPI's targets
                var providedTargetIds = targetsForKpi.Select(t => t.TargetId).ToHashSet();
                var kpiTargetIds = kpiTargets.Select(t => t.Id).ToHashSet();
                if (!providedTargetIds.SetEquals(kpiTargetIds))
                    throw new BadRequestException($"The provided targets for KPI {kpiId} must exactly match all targets for the KPI.");

                // Fetch all existing assignments for this Delivery Unit and the provided targets
                var existingAssignments = await unitOfWork.DUKPITargetAssignmentRepository.ToListAsync(
                    unitOfWork.DUKPITargetAssignmentRepository.Query(a => a.DeliveryUnitId == request.DeliveryUnitId && providedTargetIds.Contains(a.KPITargetId)),
                    cancellationToken);

                // Fetch total allocated values for each target
                var allocationSums = await unitOfWork.DUKPITargetAssignmentRepository.GetTotalAllocatedByKPITargetIdsAsync(providedTargetIds, cancellationToken);

                foreach (var kpiTarget in targetsForKpi)
                {
                    var target = kpiTargets.First(t => t.Id == kpiTarget.TargetId);

                    // Check if assignment already exists
                    if (existingAssignments.Any(a => a.KPITargetId == kpiTarget.TargetId))
                        throw new ConflictException($"DU KPI Assignment already exists for this Delivery Unit and KPI Target {kpiTarget.TargetId}.");

                    decimal allocatedValue = kpiTarget.AllocatedTargetValue;

                    if (!kpi.IsTargetValueAllocable)
                    {
                        // Automatically set to the full KPI target value for better UX
                        allocatedValue = target.TargetValue;
                    }
                    else
                    {
                        // Check remaining target value
                        var totalPreviouslyAllocated = allocationSums.GetValueOrDefault(kpiTarget.TargetId, 0);
                        var newTotalAllocatedValue = totalPreviouslyAllocated + allocatedValue;
                        if (newTotalAllocatedValue > target.TargetValue)
                            throw new BadRequestException(
                                $"The requested allocation ({allocatedValue}) causes the total allocated value to exceed the KPI target's value of {target.TargetValue}. Current total allocated: {totalPreviouslyAllocated} for target {kpiTarget.TargetId}.");
                    }

                    // Create the assignment
                    var duKpiTargetAssignment = new Domain.Entities.Planning.DUKPITargetAssignment
                    {
                        KPIId = kpiId,
                        DeliveryUnitId = request.DeliveryUnitId,
                        KPITargetId = kpiTarget.TargetId,
                        AllocatedTargetValue = allocatedValue,
                    };

                    await unitOfWork.DUKPITargetAssignmentRepository.AddAsync(duKpiTargetAssignment, cancellationToken);
                }
            }

            await unitOfWork.SaveChangesAsync(cancellationToken);
        }, cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "DU KPI Assignments created successfully.");
    }
}