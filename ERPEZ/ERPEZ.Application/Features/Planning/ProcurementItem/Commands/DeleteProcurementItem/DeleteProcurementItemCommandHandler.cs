using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementItem.Commands.DeleteProcurementItem;

public class DeleteProcurementItemCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteProcurementItemCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteProcurementItemCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ProcurementItemRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Procurement item not found.");

        unitOfWork.ProcurementItemRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Procurement item deleted successfully.");
    }
}
