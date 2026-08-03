using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.ItemCategories.Queries.GetItemCategories;

public class GetItemCategoriesQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetItemCategoriesQuery, (IReadOnlyList<ItemCategory> Entities, int TotalCount)>
{
    public async Task<(IReadOnlyList<ItemCategory> Entities, int TotalCount)> Handle(GetItemCategoriesQuery request, CancellationToken cancellationToken)
    {
        return await unitOfWork.ItemCategoryRepository.GetAllAsync(request.SieveModel, cancellationToken);
    }
}
