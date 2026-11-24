using ERPEZ.Domain.Entities.Procurement;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Procurement.ItemCategories.Queries.GetItemCategories;

public class GetItemCategoriesQuery : IRequest<(IReadOnlyList<ItemCategory> Entities, int TotalCount)>
{
    public SieveModel SieveModel { get; set; } = new();
}
