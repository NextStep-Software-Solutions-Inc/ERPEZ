using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.NonCSEItem.Commands.DeleteNonCSEItem;

public class DeleteNonCSEItemCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<DeleteNonCSEItemCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(DeleteNonCSEItemCommand request, CancellationToken cancellationToken)
    {
        var nonCseItem = await unitOfWork.NonCSEItemRepository.GetByIdAsync(request.Id, cancellationToken);
        if (nonCseItem == null)
            throw new NotFoundException("Non-CSE Item not found.");

        // Soft delete
        nonCseItem.IsDeleted = true;
        nonCseItem.DeletedAt = DateTime.UtcNow;

        unitOfWork.NonCSEItemRepository.Update(nonCseItem);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(nonCseItem.Id, "Non-CSE Item deleted successfully.");
    }
}
