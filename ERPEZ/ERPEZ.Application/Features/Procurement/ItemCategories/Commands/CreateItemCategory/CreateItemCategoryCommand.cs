using MediatR;
using ERPEZ.Domain.Entities.Procurement;

namespace ERPEZ.Application.Features.Procurement.ItemCategories.Commands.CreateItemCategory;

public class CreateItemCategoryCommand : IRequest<ItemCategory>
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
