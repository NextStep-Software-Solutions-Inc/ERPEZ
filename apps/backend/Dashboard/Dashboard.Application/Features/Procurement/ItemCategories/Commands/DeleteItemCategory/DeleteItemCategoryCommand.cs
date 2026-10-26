using MediatR;

namespace ERPEZ.Application.Features.Procurement.ItemCategories.Commands.DeleteItemCategory;

public class DeleteItemCategoryCommand : IRequest<Unit>
{
    public Guid Id { get; set; }
}
