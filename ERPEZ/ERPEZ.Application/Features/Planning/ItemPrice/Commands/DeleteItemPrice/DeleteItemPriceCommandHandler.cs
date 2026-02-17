using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ItemPrice.Commands.DeleteItemPrice;

public class DeleteItemPriceCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteItemPriceCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteItemPriceCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ItemPriceRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Item price not found.");

        unitOfWork.ItemPriceRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Item price deleted successfully.");
    }
}
