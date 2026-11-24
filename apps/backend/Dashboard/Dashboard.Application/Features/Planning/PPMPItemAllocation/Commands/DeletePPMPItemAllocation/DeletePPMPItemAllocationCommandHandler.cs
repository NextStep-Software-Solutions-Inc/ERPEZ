using ERPEZ.Domain.Interfaces;
using ERPEZ.Application.Features.Planning.PPMP.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPItemAllocation.Commands.DeletePPMPItemAllocation;

public class DeletePPMPItemAllocationCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<DeletePPMPItemAllocationCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(DeletePPMPItemAllocationCommand request, CancellationToken cancellationToken)
    {
        var allocation = await unitOfWork.PPMPItemAllocationRepository.GetByIdAsync(request.Id, cancellationToken);
        if (allocation == null)
            throw new NotFoundException("PPMP Item Allocation not found.");

        // Soft delete
        allocation.IsDeleted = true;
        allocation.DeletedAt = DateTime.UtcNow;

        unitOfWork.PPMPItemAllocationRepository.Update(allocation);
        await PPMPBudgetCalculator.RecalculateForPPMPItemAsync(unitOfWork, allocation.PPMPItemId, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(allocation.Id, "PPMP Item Allocation deleted successfully.");
    }
}
