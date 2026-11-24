using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APPItem.Commands.DeleteAPPItem;

public class DeleteAPPItemCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteAPPItemCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(DeleteAPPItemCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.APPItemRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("APP item not found.");

        unitOfWork.APPItemRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "APP item deleted successfully.");
    }
}
