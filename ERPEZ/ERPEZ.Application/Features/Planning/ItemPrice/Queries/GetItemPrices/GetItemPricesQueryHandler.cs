using ERPEZ.Application.Features.Planning.ItemPrice.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ItemPrice.Queries.GetItemPrices;

public class GetItemPricesQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetItemPricesQuery, PaginatedApiResponse<ItemPriceResponse>>
{
    public async Task<PaginatedApiResponse<ItemPriceResponse>> Handle(GetItemPricesQuery request, CancellationToken cancellationToken)
    {
        System.Linq.Expressions.Expression<Func<Domain.Entities.Planning.ItemPrice, ItemPriceResponse>> projection = ip => new ItemPriceResponse
        {
            Id = ip.Id,
            UnitPrice = ip.UnitPrice,
            ProcurementItemId = ip.ProcurementItemId,
            ProcurementItemName = ip.ProcurementItem != null ? ip.ProcurementItem.Name : string.Empty,
            FiscalYearId = ip.FiscalYearId,
            FiscalYearYear = ip.FiscalYear != null ? ip.FiscalYear.Year.ToString() : string.Empty,
            CreatedAt = ip.CreatedAt,
            UpdatedAt = ip.UpdatedAt
        };

        var (items, totalCount) = await unitOfWork.ItemPriceRepository.GetAllAsync(
            request.SieveModel,
            projection,
            cancellationToken: cancellationToken
        );

        return new PaginatedApiResponse<ItemPriceResponse>(
            [.. items],
            request.SieveModel.Page ?? 1,
            request.SieveModel.PageSize ?? 10,
            totalCount
        );
    }
}
