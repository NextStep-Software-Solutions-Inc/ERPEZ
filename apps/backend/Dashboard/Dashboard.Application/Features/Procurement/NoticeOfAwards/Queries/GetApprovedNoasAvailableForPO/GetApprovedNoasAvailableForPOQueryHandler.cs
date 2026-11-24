using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Queries.GetApprovedNoasAvailableForPO;

public class GetApprovedNoasAvailableForPOQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetApprovedNoasAvailableForPOQuery, ApiResponse<List<AvailableNoaDto>>>
{
    public async Task<ApiResponse<List<AvailableNoaDto>>> Handle(GetApprovedNoasAvailableForPOQuery request, CancellationToken cancellationToken)
    {
        var activePos = await unitOfWork.PurchaseOrderRepository.FindAllAsync(
            po => po.SourceDocumentType == SourceDocumentTypeEnum.NOA && po.Status != StatusEnum.Returned,
            cancellationToken);
        var linkedNoaIds = activePos.Select(po => po.SourceDocumentId).Distinct().ToList();

        var noas = await unitOfWork.NoticeOfAwardRepository.GetApprovedAvailableForPOAsync(linkedNoaIds, cancellationToken);

        var result = new List<AvailableNoaDto>();

        foreach (var noa in noas)
        {
            var project = await unitOfWork.ProcurementProjectRepository
                .GetWithAwardDetailsByIdAsync(noa.ProcurementProjectId, cancellationToken);

            var cprItems = project?.ConsolidatedPRId.HasValue == true
                ? await unitOfWork.ConsolidatedPRItemRepository.FindAllAsync(
                    ci => ci.ConsolidatedPRId == project.ConsolidatedPRId.Value,
                    cancellationToken
                )
                : [];

            var prItemIds = cprItems.Select(ci => ci.PRItemId).Distinct().ToList();
            var prItems = prItemIds.Count > 0
                ? await unitOfWork.PRItemRepository.GetByIdsWithPPMPItemAsync(prItemIds, cancellationToken)
                : [];

            var lineItems = cprItems.Select(ci =>
            {
                var pi = prItems.FirstOrDefault(p => p.Id == ci.PRItemId);
                var unitPrice = pi?.UnitCost > 0 ? pi.UnitCost : (project?.ABC ?? noa.AwardedAmount);
                var qty = pi?.RequestedQuantity ?? 1;
                var amount = pi?.Amount > 0 ? pi.Amount : (qty * unitPrice);

                return new AvailableNoaItemDto
                {
                    Id = ci.Id.ToString(),
                    ItemName = pi?.Name ?? project?.Title ?? "Procurement Item",
                    Category = "Goods & Services",
                    Description = pi?.Description ?? string.Empty,
                    Quantity = qty,
                    Unit = pi?.PPMPItem?.Unit ?? "lot",
                    UnitPrice = unitPrice,
                    Amount = amount
                };
            }).ToList();

            if (lineItems.Count == 0 && project?.APPItemLinks != null && project.APPItemLinks.Count > 0)
            {
                lineItems = project.APPItemLinks
                    .OrderBy(l => l.Order)
                    .Select(l =>
                    {
                        var ppmp = l.APPItem?.PPMPItem;
                        var unitPrice = ppmp?.UnitPrice > 0 ? ppmp.UnitPrice : (project.ABC > 0 ? project.ABC : noa.AwardedAmount);
                        var qty = ppmp?.PlannedQuantity > 0 ? ppmp.PlannedQuantity : 1;
                        var amount = (l.APPItem?.EstimatedBudgetOverride.HasValue == true && l.APPItem.EstimatedBudgetOverride.Value > 0)
                            ? l.APPItem.EstimatedBudgetOverride.Value
                            : (qty * unitPrice);

                        return new AvailableNoaItemDto
                        {
                            Id = (l.APPItem?.Id ?? l.Id).ToString(),
                            ItemName = ppmp?.Name ?? l.APPItem?.Remarks ?? project.Title,
                            Category = "Goods & Services",
                            Description = ppmp?.Description ?? l.APPItem?.Remarks ?? string.Empty,
                            Quantity = qty,
                            Unit = ppmp?.Unit ?? "lot",
                            UnitPrice = unitPrice,
                            Amount = amount
                        };
                    }).ToList();
            }

            if (lineItems.Count == 0)
            {
                lineItems =
                [
                    new AvailableNoaItemDto
                    {
                        Id = noa.Id.ToString(),
                        ItemName = !string.IsNullOrWhiteSpace(noa.Description) ? noa.Description : (project?.Title ?? "Awarded Procurement Package"),
                        Category = "Goods & Services",
                        Description = noa.Description,
                        Quantity = 1,
                        Unit = "lot",
                        UnitPrice = noa.AwardedAmount,
                        Amount = noa.AwardedAmount
                    }
                ];
            }

            result.Add(new AvailableNoaDto
            {
                Id = noa.Id,
                NOANumber = noa.NOANumber,
                Description = noa.Description,
                SupplierId = noa.SupplierId,
                SupplierName = noa.Supplier?.Name ?? string.Empty,
                TotalAmount = noa.AwardedAmount,
                NOADate = noa.NOADate,
                LineItems = lineItems
            });
        }

        return ApiResponse<List<AvailableNoaDto>>.Success(result);
    }
}
