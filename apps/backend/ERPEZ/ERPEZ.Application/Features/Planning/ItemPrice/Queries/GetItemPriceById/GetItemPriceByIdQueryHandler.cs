using ERPEZ.Application.Features.Planning.ItemPrice.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ItemPrice.Queries.GetItemPriceById;

public class GetItemPriceByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetItemPriceByIdQuery, ApiResponse<ItemPriceDetailedResponse>>
{
    public async Task<ApiResponse<ItemPriceDetailedResponse>> Handle(GetItemPriceByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ItemPriceRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Item price not found.");

        var response = new ItemPriceDetailedResponse
        {
            Id = entity.Id,
            UnitPrice = entity.UnitPrice,
            ProcurementItemId = entity.ProcurementItemId,
            ProcurementItem = entity.ProcurementItem != null ? new ProcurementItemInfo
            {
                Id = entity.ProcurementItem.Id,
                Name = entity.ProcurementItem.Name,
                Specifications = entity.ProcurementItem.Specifications,
                Type = entity.ProcurementItem.Type,
                ProductCode = entity.ProcurementItem.ProductCode
            } : null,
            FiscalYearId = entity.FiscalYearId,
            FiscalYear = entity.FiscalYear != null ? new FiscalYearInfo
            {
                Id = entity.FiscalYear.Id,
                Year = entity.FiscalYear.Year.ToString()
            } : null,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };

        return ApiResponse<ItemPriceDetailedResponse>.Success(response, "Item price retrieved successfully.");
    }
}
