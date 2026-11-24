using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Dtos;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;

namespace ERPEZ.Application.Features.Procurement.Contracts.Utils;

public static class ContractLineItemResolver
{
    public static async Task<List<AwardedLineItemDto>> ResolveLineItemsAsync(
        IUnitOfWork unitOfWork,
        ProcurementProject? project,
        NoticeOfAward noa,
        CancellationToken cancellationToken)
    {
        var lineItems = new List<AwardedLineItemDto>();

        if (project?.ConsolidatedPRId.HasValue == true)
        {
            var cprItems = await unitOfWork.ConsolidatedPRItemRepository.ToListAsync(
                unitOfWork.ConsolidatedPRItemRepository.Query(ci => ci.ConsolidatedPRId == project.ConsolidatedPRId.Value),
                cancellationToken
            );

            var prItemIds = cprItems.Select(ci => ci.PRItemId).Distinct().ToList();
            var prItems = prItemIds.Count > 0
                ? await unitOfWork.PRItemRepository.ToListAsync(
                    unitOfWork.PRItemRepository.Query(pi => prItemIds.Contains(pi.Id)),
                    cancellationToken
                )
                : [];

            lineItems = cprItems.Select(ci =>
            {
                var pi = prItems.FirstOrDefault(p => p.Id == ci.PRItemId);
                var unitPrice = pi?.UnitCost > 0 ? pi.UnitCost : (project.ABC > 0 ? project.ABC : noa.AwardedAmount);
                var qty = pi?.RequestedQuantity ?? 1;
                var amount = pi?.Amount > 0 ? pi.Amount : (qty * unitPrice);

                return new AwardedLineItemDto
                {
                    Id = ci.Id.ToString(),
                    ItemName = pi?.Name ?? project.Title,
                    Category = "Goods & Services",
                    Description = pi?.Description ?? string.Empty,
                    Quantity = qty,
                    Unit = "lot",
                    UnitPrice = unitPrice,
                    Amount = amount
                };
            }).ToList();
        }

        if (lineItems.Count == 0 && project?.APPItemLinks != null && project.APPItemLinks.Count > 0)
        {
            lineItems = project.APPItemLinks
                .OrderBy(l => l.Order)
                .Select(l =>
                {
                    var appItem = l.APPItem;
                    var ppmpItem = appItem?.PPMPItem;
                    var category = ppmpItem?.ProjectType switch
                    {
                        ProcurementProjectType.Infrastructure => "Infrastructure",
                        ProcurementProjectType.ConsultingServices => "Consulting",
                        _ => "Goods & Services"
                    };
                    var unitPrice = ppmpItem?.UnitPrice > 0 ? ppmpItem.UnitPrice : (project.ABC > 0 ? project.ABC : noa.AwardedAmount);
                    var qty = ppmpItem?.PlannedQuantity > 0 ? ppmpItem.PlannedQuantity : 1;
                    var amount = (appItem?.EstimatedBudgetOverride.HasValue == true && appItem.EstimatedBudgetOverride.Value > 0)
                        ? appItem.EstimatedBudgetOverride.Value
                        : (qty * unitPrice);

                    return new AwardedLineItemDto
                    {
                        Id = (appItem?.Id ?? l.Id).ToString(),
                        ItemName = ppmpItem?.Name ?? appItem?.Remarks ?? project.Title,
                        Category = category,
                        Description = ppmpItem?.Description ?? appItem?.Remarks ?? string.Empty,
                        Quantity = qty,
                        Unit = ppmpItem?.Unit ?? "lot",
                        UnitPrice = unitPrice,
                        Amount = amount
                    };
                }).ToList();
        }

        if (lineItems.Count == 0)
        {
            lineItems =
            [
                new AwardedLineItemDto
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

        return lineItems;
    }
}
