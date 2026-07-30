using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.ItemCategories.Commands.DeleteItemCategory;

public class DeleteItemCategoryCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<DeleteItemCategoryCommand, Unit>
{
    public async Task<Unit> Handle(DeleteItemCategoryCommand request, CancellationToken cancellationToken)
    {
        var itemCategory = await unitOfWork.ItemCategoryRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"ItemCategory with ID {request.Id} not found.");

        unitOfWork.ItemCategoryRepository.Remove(itemCategory);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
