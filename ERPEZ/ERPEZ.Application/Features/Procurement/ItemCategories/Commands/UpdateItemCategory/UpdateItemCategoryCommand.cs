using MediatR;
using ERPEZ.Domain.Entities.Procurement;

namespace ERPEZ.Application.Features.Procurement.ItemCategories.Commands.UpdateItemCategory;

public class UpdateItemCategoryCommand : IRequest<ItemCategory>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
}
