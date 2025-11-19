using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Commands.CreateDUAllocation;

public class CreateDUAllocationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateDUAllocationCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateDUAllocationCommand request, CancellationToken cancellationToken)
    {
        Guid? duAllocationId = null;
        
        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            // Validate Delivery Unit exists
            _ = await unitOfWork.DeliveryUnitRepository.FindAsync(du => du.Id == request.DeliveryUnitId, cancellationToken) ?? throw new NotFoundException("Delivery Unit not found");
            
            // Get all unique ReceivedFund IDs
            var receivedFundIds = request.DUFundAllocations.Select(f => f.ReceivedFundId).Distinct().ToList();
            
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
            
            // Create a lookup for ReceivedFunds
            var receivedFundLookup = receivedFunds.ToDictionary(rf => rf.Id);
            
            // Fetch all existing DUFundAllocations for these funds in one query
            var existingAllocations = await unitOfWork.DUFundAllocationRepository.ToListAsync(
                unitOfWork.DUFundAllocationRepository.Query(alloc => receivedFundIds.Contains(alloc.ReceivedFundId)),
                cancellationToken);
            
            // Group existing allocations by ReceivedFundId
            var allocationsByFund = existingAllocations.GroupBy(alloc => alloc.ReceivedFundId)
                .ToDictionary(g => g.Key, g => g.Sum(alloc => alloc.Amount));
            
            // Validate all fund allocations
            foreach (var fundAllocationRequest in request.DUFundAllocations)
            {
                var receivedFund = receivedFundLookup[fundAllocationRequest.ReceivedFundId];
                var currentAllocatedAmount = allocationsByFund.GetValueOrDefault(fundAllocationRequest.ReceivedFundId, 0);
                
                if (currentAllocatedAmount + fundAllocationRequest.Amount > receivedFund.Amount)
                {
                    throw new BadRequestException($"Insufficient funds in Received Fund {receivedFund.Id}. Available: {receivedFund.Amount - currentAllocatedAmount}, Requested: {fundAllocationRequest.Amount}");
                }
            }
            
            // Create DUAllocation
            var duAllocation = new Domain.Entities.Planning.DUAllocation
            {
                DeliveryUnitId = request.DeliveryUnitId,
                Purpose = request.Purpose,
                Amount = request.Amount
            };
            await unitOfWork.DUAllocationRepository.AddAsync(duAllocation, cancellationToken);
            
            // Create all DUFundAllocations
            foreach (var fundAllocationRequest in request.DUFundAllocations)
            {
                var duFundAllocation = new Domain.Entities.Planning.DUFundAllocation
                {
                    DUAllocationId = duAllocation.Id,
                    ReceivedFundId = fundAllocationRequest.ReceivedFundId,
                    Amount = fundAllocationRequest.Amount
                };
                await unitOfWork.DUFundAllocationRepository.AddAsync(duFundAllocation, cancellationToken);
            }
            
            duAllocationId = duAllocation.Id;
            
            // Save all changes within the transaction
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }, cancellationToken);
        
        return ApiResponse<Guid>.Success(duAllocationId!.Value, "Delivery Unit Allocation created successfully.");
    }
}
