using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPItem.Commands.DeletePPMPItem;

public class DeletePPMPItemCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<DeletePPMPItemCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(DeletePPMPItemCommand request, CancellationToken cancellationToken)
    {
        var ppmpItem = await unitOfWork.PPMPItemRepository.GetByIdAsync(request.Id, cancellationToken);
        if (ppmpItem == null)
            throw new NotFoundException("PPMP Item not found.");

        // Soft delete
        ppmpItem.IsDeleted = true;
        ppmpItem.DeletedAt = DateTime.UtcNow;

        unitOfWork.PPMPItemRepository.Update(ppmpItem);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(ppmpItem.Id, "PPMP Item deleted successfully.");
    }
}
