using ERPEZ.Domain.Interfaces;
using ERPEZ.Application.Features.Planning.PPMP.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPItemAllocation.Commands.CreatePPMPItemAllocation;

public class CreatePPMPItemAllocationCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<CreatePPMPItemAllocationCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreatePPMPItemAllocationCommand request, CancellationToken cancellationToken)
    {
        // Validate PPMP Item exists
        var ppmpItem = await unitOfWork.PPMPItemRepository.GetByIdAsync(request.PPMPItemId, cancellationToken);
        if (ppmpItem == null)
            throw new NotFoundException("PPMP Item not found.");

        // Check for duplicate allocation for the same month
        var existingAllocation = await unitOfWork.PPMPItemAllocationRepository.FindAsync(
            a => a.PPMPItemId == request.PPMPItemId && a.AllocationMonth == request.AllocationMonth,
            cancellationToken);

        if (existingAllocation != null)
            throw new ConflictException($"Allocation for {request.AllocationMonth} already exists for this PPMP Item.");

        var computedAmount = await PPMPItemAllocationAmountCalculator.CalculateAmountAsync(
            unitOfWork,
            request.PPMPItemId,
            request.Quantity,
            cancellationToken);

        // Create PPMP Item Allocation
        var allocation = new Domain.Entities.Planning.PPMPItemAllocation
        {
            Id = Guid.NewGuid(),
            PPMPItemId = request.PPMPItemId,
            AllocationMonth = request.AllocationMonth,
            Quantity = request.Quantity,
            Amount = computedAmount,
            CreatedAt = DateTime.UtcNow
        };

        await unitOfWork.PPMPItemAllocationRepository.AddAsync(allocation, cancellationToken);
    await PPMPBudgetCalculator.RecalculateForPPMPItemAsync(unitOfWork, request.PPMPItemId, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(allocation.Id, "PPMP Item Allocation created successfully.");
    }
}
