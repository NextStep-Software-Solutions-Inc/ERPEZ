using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.ItemCategories.Commands.UpdateItemCategory;

public class UpdateItemCategoryCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<UpdateItemCategoryCommand, ItemCategory>
{
    public async Task<ItemCategory> Handle(UpdateItemCategoryCommand request, CancellationToken cancellationToken)
    {
        var itemCategory = await unitOfWork.ItemCategoryRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"ItemCategory with ID {request.Id} not found.");

        itemCategory.Name = request.Name;
        itemCategory.Description = request.Description;
        itemCategory.IsActive = request.IsActive;

        unitOfWork.ItemCategoryRepository.Update(itemCategory);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return itemCategory;
    }
}
