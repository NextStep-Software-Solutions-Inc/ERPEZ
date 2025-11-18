using ERPEZ.Application.Features.Planning.DUKPIAssignment.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Commands.CreateDUKPIAssignment;

public class CreateDUKPIAssignmentCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateDUKPIAssignmentCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(CreateDUKPIAssignmentCommand request, CancellationToken cancellationToken)
    {
        // Fetch KPI
        var kpi = await unitOfWork.KPIRepository.GetByIdAsync(request.KPIId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI not found.");

        // Fetch Delivery Unit
        _ = await unitOfWork.DeliveryUnitRepository.GetByIdAsync(request.DeliveryUnitId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Delivery Unit not found.");

        // Fetch all targets for the KPI
        var kpiTargets = await unitOfWork.KPITargetRepository.Query(t => t.KPIId == kpi.Id)
            .ToListAsync(cancellationToken);

        // Verify that all provided targets match the KPI's targets
        var providedTargetIds = request.DUKPITargets.Select(t => t.TargetId).ToHashSet();
        var kpiTargetIds = kpiTargets.Select(t => t.Id).ToHashSet();
        if (!providedTargetIds.SetEquals(kpiTargetIds))
            throw new BadRequestException("The provided targets must exactly match all targets for the KPI.");

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            // Fetch all existing assignments for this Delivery Unit and the provided targets
            var existingAssignments = await unitOfWork.DUKPIAssignmentRepository.Query(a => a.DeliveryUnitId == request.DeliveryUnitId && providedTargetIds.Contains(a.KPITargetId)).ToListAsync(cancellationToken);

            // Fetch total allocated values for each target
            var allocationSums = await unitOfWork.DUKPIAssignmentRepository
                .Query(a => providedTargetIds.Contains(a.KPITargetId)).GroupBy(a => a.KPITargetId)
                .Select(g => new
                {
                    TargetId = g.Key,
                    Total = g.Sum(a => a.AllocatedTargetValue)
                })
                .ToDictionaryAsync(x => x.TargetId, x => x.Total, cancellationToken);

            foreach (var duKpiTarget in request.DUKPITargets)
            {
                var kpiTarget = kpiTargets.First(t => t.Id == duKpiTarget.TargetId);

                // Check if assignment already exists
                if (existingAssignments.Any(a => a.KPITargetId == duKpiTarget.TargetId))
                    throw new ConflictException($"DU KPI Assignment already exists for this Delivery Unit and KPI Target {duKpiTarget.TargetId}.");

                decimal allocatedValue = duKpiTarget.AllocatedTargetValue;

                if (!kpi.IsTargetValueAllocable)
                {
                    // Automatically set to the full KPI target value for better UX
                    allocatedValue = kpiTarget.TargetValue;
                }
                else
                {
                    // Check remaining target value
                    var totalPreviouslyAllocated = allocationSums.GetValueOrDefault(duKpiTarget.TargetId, 0);
                    var newTotalAllocatedValue = totalPreviouslyAllocated + allocatedValue;
                    if (newTotalAllocatedValue > kpiTarget.TargetValue)
                        throw new BadRequestException(
                            $"The requested allocation ({allocatedValue}) causes the total allocated value to exceed the KPI target's value of {kpiTarget.TargetValue}. Current total allocated: {totalPreviouslyAllocated} for target {duKpiTarget.TargetId}.");
                }

                // Create the assignment
                var duKpiAssignment = new Domain.Entities.Planning.DUKPIAssignment
                {
                    KPIId = request.KPIId,
                    DeliveryUnitId = request.DeliveryUnitId,
                    KPITargetId = duKpiTarget.TargetId,
                    AllocatedTargetValue = allocatedValue,
                };

                await unitOfWork.DUKPIAssignmentRepository.AddAsync(duKpiAssignment, cancellationToken);
            }

            await unitOfWork.SaveChangesAsync(cancellationToken);
        }, cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "DU KPI Assignments created successfully.");
    }
}
