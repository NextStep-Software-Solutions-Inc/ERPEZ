using ERPEZ.Application.Features.Planning.DUAllocation.Commands.CreateDUAllocation;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Commands.UpdateDUAllocation;

public class UpdateDUAllocationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateDUAllocationCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(UpdateDUAllocationCommand request, CancellationToken cancellationToken)
    {
        Domain.Entities.Planning.DUAllocation? updatedAllocation = null;

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var dto = request.UpdateDUAllocation;
            var duAllocation = await unitOfWork.DUAllocationRepository.GetByIdAsync(request.Id, cancellationToken) 
                ?? throw new NotFoundException("Delivery Unit Allocation not found.");

            // Update basic properties
            if (dto?.Purpose != null) duAllocation.Purpose = dto.Purpose;
            if (dto?.Amount.HasValue == true) duAllocation.Amount = dto.Amount.Value;

            // Handle DUFundAllocations if provided
            if (dto?.DUFundAllocations != null)
            {
                await HandleDUFundAllocationsUpdateAsync(duAllocation, dto.DUFundAllocations, cancellationToken);
            }

            unitOfWork.DUAllocationRepository.Update(duAllocation);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            
            updatedAllocation = duAllocation;
        }, cancellationToken);

        return ApiResponse<Guid>.Success(updatedAllocation!.Id, "Delivery Unit Allocation updated successfully.");
    }

    private async Task HandleDUFundAllocationsUpdateAsync(
        Domain.Entities.Planning.DUAllocation duAllocation, 
        List<DUFundAllocationRequest> newAllocations, 
        CancellationToken cancellationToken)
    {
        // Get existing allocations for this DUAllocation
        var existingAllocations = await unitOfWork.DUFundAllocationRepository.ToListAsync(
            unitOfWork.DUFundAllocationRepository.Query(alloc => alloc.DUAllocationId == duAllocation.Id),
            cancellationToken);

        // Get all unique ReceivedFund IDs from new allocations
        var receivedFundIds = newAllocations.Select(f => f.ReceivedFundId).Distinct().ToList();
        
        // Fetch all ReceivedFunds in one query
        var receivedFunds = await unitOfWork.ReceivedFundRepository.ToListAsync(
            unitOfWork.ReceivedFundRepository.Query(rf => receivedFundIds.Contains(rf.Id)),
            cancellationToken);
        
        // Validate all ReceivedFunds exist
        var missingFundIds = receivedFundIds.Except(receivedFunds.Select(rf => rf.Id)).ToList();
        if (missingFundIds.Count != 0)
        {
            throw new NotFoundException($"Received Funds not found: {string.Join(", ", missingFundIds)}");
        }
        
        // Create lookup for ReceivedFunds
        var receivedFundLookup = receivedFunds.ToDictionary(rf => rf.Id);
        
        // Get all existing allocations for these funds (excluding current DUAllocation)
        var existingAllocationsForFunds = await unitOfWork.DUFundAllocationRepository.ToListAsync(
            unitOfWork.DUFundAllocationRepository.Query(alloc => 
                receivedFundIds.Contains(alloc.ReceivedFundId) && alloc.DUAllocationId != duAllocation.Id),
            cancellationToken);
        
        // Group existing allocations by ReceivedFundId
        var allocationsByFund = existingAllocationsForFunds.GroupBy(alloc => alloc.ReceivedFundId)
            .ToDictionary(g => g.Key, g => g.Sum(alloc => alloc.Amount));
        
        // Validate all new allocations
        foreach (var newAllocation in newAllocations)
        {
            var receivedFund = receivedFundLookup[newAllocation.ReceivedFundId];
            var currentAllocatedAmount = allocationsByFund.GetValueOrDefault(newAllocation.ReceivedFundId, 0);
            
            if (currentAllocatedAmount + newAllocation.Amount > receivedFund.Amount)
            {
                throw new BadRequestException($"Insufficient funds in Received Fund {receivedFund.Id}. Available: {receivedFund.Amount - currentAllocatedAmount}, Requested: {newAllocation.Amount}");
            }
        }
        
        // Determine changes: compare existing vs new
        var existingByFund = existingAllocations.ToDictionary(e => e.ReceivedFundId);
        var newByFund = newAllocations.ToDictionary(n => n.ReceivedFundId);
        
        // Remove allocations that are no longer in the request
        var toRemove = existingAllocations.Where(e => !newByFund.ContainsKey(e.ReceivedFundId)).ToList();
        foreach (var allocation in toRemove)
        {
            unitOfWork.DUFundAllocationRepository.Remove(allocation);
        }
        
        // Add new allocations or update existing ones
        foreach (var newAllocation in newAllocations)
        {
            if (existingByFund.TryGetValue(newAllocation.ReceivedFundId, out var existing))
            {
                // Update existing
                existing.Amount = newAllocation.Amount;
                unitOfWork.DUFundAllocationRepository.Update(existing);
            }
            else
            {
                // Add new
                var duFundAllocation = new Domain.Entities.Planning.DUFundAllocation
                {
                    DUAllocationId = duAllocation.Id,
                    ReceivedFundId = newAllocation.ReceivedFundId,
                    Amount = newAllocation.Amount
                };
                await unitOfWork.DUFundAllocationRepository.AddAsync(duFundAllocation, cancellationToken);
            }
        }
    }
}
