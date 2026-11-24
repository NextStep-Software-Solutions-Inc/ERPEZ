using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.DeleteAOB;

public class DeleteAOBCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteAOBCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteAOBCommand request, CancellationToken cancellationToken)
    {
        var aob = await unitOfWork.AOBRepository.Query()
            .Include(a => a.AOBRFQMappings)
            .Include(a => a.AOBAwardedItems)
            .FirstOrDefaultAsync(a => a.Id == request.Id && !a.IsDeleted, cancellationToken);

        if (aob == null)
        {
            return ApiResponse<Unit>.Fail("Abstract of Bids (AOB) not found.");
        }

        if (aob.Status == StatusEnum.Approved)
        {
            return ApiResponse<Unit>.Fail("Approved Abstract of Bids (AOB) cannot be deleted.");
        }

        // Remove linked mappings
        var mappings = aob.AOBRFQMappings.ToList();
        foreach (var mapping in mappings)
        {
            unitOfWork.AOBRFQMappingRepository.Remove(mapping, hardDelete: true);
        }

        // Remove linked awarded items
        var awardedItems = aob.AOBAwardedItems.ToList();
        foreach (var awardedItem in awardedItems)
        {
            unitOfWork.AOBAwardedItemRepository.Remove(awardedItem, hardDelete: true);
        }

        // Soft delete the AOB header
        unitOfWork.AOBRepository.Remove(aob);
        
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Abstract of Bids (AOB) and related records deleted successfully.");
    }
}
