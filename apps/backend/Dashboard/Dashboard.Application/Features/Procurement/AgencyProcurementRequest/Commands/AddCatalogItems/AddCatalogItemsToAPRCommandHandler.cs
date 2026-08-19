using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.AddCatalogItems;

public class AddCatalogItemsToAPRCommandHandler(
    IUnitOfWork unitOfWork,
    ILogger<AddCatalogItemsToAPRCommandHandler> logger)
    : IRequestHandler<AddCatalogItemsToAPRCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        AddCatalogItemsToAPRCommand request, CancellationToken cancellationToken)
    {
        var apr = await unitOfWork.APRRepository.GetAPRWithDetailsAsync(request.APRId, cancellationToken)
            ?? throw new NotFoundException("APR not found.");

        if (apr.Status != StatusEnum.Draft && apr.Status != StatusEnum.Returned)
        {
            return ApiResponse<Guid>.Fail(
                $"Only APRs in Draft or Returned status can be edited. Current status: {apr.Status}.");
        }

        if (request.Items.Count == 0)
        {
            return ApiResponse<Guid>.Fail("No catalog items provided to add.");
        }

        var existingByCode = apr.APRItems
            .Where(i => !string.IsNullOrWhiteSpace(i.ItemCode))
            .ToDictionary(i => i.ItemCode!.Trim().ToLowerInvariant());

        foreach (var itemDto in request.Items)
        {
            var codeKey = itemDto.ItemCode.Trim().ToLowerInvariant();
            var unitPrice = itemDto.UnitPrice;
            var quantity = itemDto.Quantity <= 0 ? 1 : itemDto.Quantity;
            var totalCost = unitPrice * quantity;

            if (existingByCode.TryGetValue(codeKey, out var existingItem))
            {
                existingItem.QuantityRequested = quantity;
                existingItem.UnitCost = unitPrice;
                existingItem.TotalCost = totalCost;
                existingItem.Description = itemDto.Description;
                if (!string.IsNullOrWhiteSpace(itemDto.Unit))
                {
                    existingItem.Unit = itemDto.Unit;
                }
            }
            else
            {
                var newItem = new APRItem
                {
                    APRId = apr.Id,
                    ItemCode = itemDto.ItemCode.Trim(),
                    Description = itemDto.Description,
                    Unit = !string.IsNullOrWhiteSpace(itemDto.Unit) ? itemDto.Unit : "Unit",
                    QuantityRequested = quantity,
                    UnitCost = unitPrice,
                    TotalCost = totalCost,
                    CreatedBy = "system"
                };

                apr.APRItems.Add(newItem);
            }
        }

        apr.TotalAmount = apr.APRItems.Sum(i => i.TotalCost);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Successfully added/updated {Count} catalog item(s) in APR {AprId}",
            request.Items.Count, apr.Id);

        return ApiResponse<Guid>.Success(apr.Id, $"{request.Items.Count} catalog item(s) saved to APR successfully.");
    }
}
