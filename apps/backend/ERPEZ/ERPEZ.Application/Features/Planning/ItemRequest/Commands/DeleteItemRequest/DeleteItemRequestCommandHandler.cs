using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ItemRequest.Commands.DeleteItemRequest;

public class DeleteItemRequestCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<DeleteItemRequestCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(DeleteItemRequestCommand request, CancellationToken cancellationToken)
    {
        var itemRequest = await unitOfWork.ItemRequestRepository.GetByIdAsync(request.Id, cancellationToken);
        if (itemRequest == null)
            throw new NotFoundException("Item Request not found.");

        // Soft delete
        itemRequest.IsDeleted = true;
        itemRequest.DeletedAt = DateTime.UtcNow;

        unitOfWork.ItemRequestRepository.Update(itemRequest);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(itemRequest.Id, "Item Request deleted successfully.");
    }
}
