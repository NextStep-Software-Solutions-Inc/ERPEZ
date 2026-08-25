using ERPEZ.Domain.Interfaces;
using ERPEZ.Application.Features.Planning.PPMP.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPItemAllocation.Commands.UpdatePPMPItemAllocation;

public class UpdatePPMPItemAllocationCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<UpdatePPMPItemAllocationCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(UpdatePPMPItemAllocationCommand request, CancellationToken cancellationToken)
    {
        // Get existing allocation
        var allocation = await unitOfWork.PPMPItemAllocationRepository.GetByIdAsync(request.Id, cancellationToken);
        if (allocation == null)
            throw new NotFoundException("PPMP Item Allocation not found.");

        // Check for duplicate allocation month if being updated
        if (request.AllocationMonth.HasValue && request.AllocationMonth.Value != allocation.AllocationMonth)
        {
            var existingAllocation = await unitOfWork.PPMPItemAllocationRepository.FindAsync(
                a => a.PPMPItemId == allocation.PPMPItemId && a.AllocationMonth == request.AllocationMonth.Value,
                cancellationToken);

            if (existingAllocation != null)
                throw new ConflictException($"Allocation for {request.AllocationMonth.Value} already exists for this PPMP Item.");
        }

        // Update properties
        if (request.AllocationMonth.HasValue)
            allocation.AllocationMonth = request.AllocationMonth.Value;

        if (request.Quantity.HasValue)
        {
            var ppmpItem = await unitOfWork.PPMPItemRepository.GetByIdAsync(allocation.PPMPItemId, cancellationToken);
            if (ppmpItem != null && ppmpItem.PlannedQuantity > 0)
            {
                var allocations = await unitOfWork.PPMPItemAllocationRepository.FindAllAsync(
                    a => a.PPMPItemId == allocation.PPMPItemId && a.Id != allocation.Id, cancellationToken);
                var currentAllocatedSum = allocations.Sum(a => a.Quantity);

                if (currentAllocatedSum + request.Quantity.Value > ppmpItem.PlannedQuantity)
                {
                    throw new ValidationException(
                        $"Allocated quantity ({currentAllocatedSum + request.Quantity.Value}) cannot exceed planned quantity ({ppmpItem.PlannedQuantity}).");
                }
            }
            allocation.Quantity = request.Quantity.Value;
        }

        allocation.Amount = await PPMPItemAllocationAmountCalculator.CalculateAmountAsync(
            unitOfWork,
            allocation.PPMPItemId,
            allocation.Quantity,
            cancellationToken);

        allocation.UpdatedAt = DateTime.UtcNow;

        unitOfWork.PPMPItemAllocationRepository.Update(allocation);
        await PPMPBudgetCalculator.RecalculateForPPMPItemAsync(unitOfWork, allocation.PPMPItemId, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(allocation.Id, "PPMP Item Allocation updated successfully.");
    }
}
