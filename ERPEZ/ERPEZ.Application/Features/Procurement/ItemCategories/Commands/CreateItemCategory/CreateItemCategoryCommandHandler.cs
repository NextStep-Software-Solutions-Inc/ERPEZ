using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.ItemCategories.Commands.CreateItemCategory;

public class CreateItemCategoryCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<CreateItemCategoryCommand, ItemCategory>
{
    public async Task<ItemCategory> Handle(CreateItemCategoryCommand request, CancellationToken cancellationToken)
    {
        var itemCategory = new ItemCategory
        {
            Name = request.Name,
            Description = request.Description
        };

        await unitOfWork.ItemCategoryRepository.AddAsync(itemCategory, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return itemCategory;
    }
}
