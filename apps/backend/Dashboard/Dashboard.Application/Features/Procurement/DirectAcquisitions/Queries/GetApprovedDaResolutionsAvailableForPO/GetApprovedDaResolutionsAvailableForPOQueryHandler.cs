using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Queries.GetApprovedDaResolutionsAvailableForPO;

public class GetApprovedDaResolutionsAvailableForPOQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetApprovedDaResolutionsAvailableForPOQuery, ApiResponse<List<AvailableDaResolutionDto>>>
{
    public async Task<ApiResponse<List<AvailableDaResolutionDto>>> Handle(GetApprovedDaResolutionsAvailableForPOQuery request, CancellationToken cancellationToken)
    {
        var activePos = await unitOfWork.PurchaseOrderRepository.FindAllAsync(
            po => po.SourceDocumentType == SourceDocumentTypeEnum.BAC_RESOLUTION && po.Status != StatusEnum.Returned,
            cancellationToken);
        var linkedDaIds = activePos.Select(po => po.SourceDocumentId).Distinct().ToList();

        var das = await unitOfWork.DirectAcquisitionRepository.GetApprovedAvailableForPOAsync(linkedDaIds, cancellationToken);

        var result = das.Select(da =>
        {
            var resolution = da.BACProject?.BACResolutions.FirstOrDefault();
            var allCprItems = da.ConsolidatedPR?.ConsolidatedPRItems ?? [];
            var filteredItems = allCprItems.AsEnumerable();

            if (!string.IsNullOrWhiteSpace(da.Remarks) && da.Remarks.StartsWith("SELECTED_ITEMS:"))
            {
                var rawIds = da.Remarks.Substring("SELECTED_ITEMS:".Length).Split(',', StringSplitOptions.RemoveEmptyEntries);
                var selectedSet = rawIds.Select(idStr => Guid.TryParse(idStr, out var g) ? g : Guid.Empty)
                                        .Where(g => g != Guid.Empty)
                                        .ToHashSet();

                if (selectedSet.Count > 0)
                {
                    filteredItems = allCprItems.Where(ci => selectedSet.Contains(ci.Id) || selectedSet.Contains(ci.PRItemId));
                }
            }

            var items = filteredItems.Select(ci => new AvailableDaItemDto
            {
                Id = ci.Id,
                ItemName = ci.PRItem?.Name ?? "Direct Acquisition Item",
                ItemDescription = ci.PRItem?.Description,
                Quantity = ci.PRItem?.RequestedQuantity ?? 1,
                Unit = ci.PRItem?.PPMPItem?.Unit ?? "unit",
                UnitPrice = ci.PRItem?.UnitCost ?? 0,
                TotalAmount = ci.PRItem?.Amount > 0 ? ci.PRItem.Amount : ((ci.PRItem?.RequestedQuantity ?? 1) * (ci.PRItem?.UnitCost ?? 0)),
                Fund = ci.PurchaseRequest?.FundSource?.Code ?? ci.PurchaseRequest?.FundSource?.Name,
                Office = ci.PurchaseRequest?.Office?.Name
            }).ToList();

            return new AvailableDaResolutionDto
            {
                Id = da.Id,
                DANumber = da.DANumber,
                Description = da.ConsolidatedPR?.Description ?? $"Direct Acquisition {da.DANumber}",
                CPRNumber = da.ConsolidatedPR?.CPRNumber ?? string.Empty,
                BACResolutionNumber = resolution?.ResolutionNumber,
                TotalABC = da.TotalABC,
                CreatedAt = da.CreatedAt,
                ConsolidatedPRItems = items
            };
        }).ToList();

        return ApiResponse<List<AvailableDaResolutionDto>>.Success(result);
    }
}
