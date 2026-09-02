using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Dtos;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Queries.GetAvailableAwardBacResolutions;

public record GetAvailableAwardBacResolutionsQuery : IRequest<ApiResponse<List<AvailableAwardBacResolutionDto>>>;

public class GetAvailableAwardBacResolutionsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetAvailableAwardBacResolutionsQuery, ApiResponse<List<AvailableAwardBacResolutionDto>>>
{
    public async Task<ApiResponse<List<AvailableAwardBacResolutionDto>>> Handle(GetAvailableAwardBacResolutionsQuery request, CancellationToken cancellationToken)
    {
        var existingNoas = await unitOfWork.NoticeOfAwardRepository.ToListAsync(
            unitOfWork.NoticeOfAwardRepository.Query(n => !n.IsDeleted),
            cancellationToken
        );
        var usedResolutionIds = existingNoas.Select(n => n.BACResolutionId).ToHashSet();

        var allResolutions = await unitOfWork.BACResolutionRepository.ToListAsync(
            unitOfWork.BACResolutionRepository.Query(r => !r.IsDeleted),
            cancellationToken
        );

        var projectIds = allResolutions.Select(r => r.ProcurementProjectId).Distinct().ToList();
        var projects = await unitOfWork.ProcurementProjectRepository.ToListAsync(
            unitOfWork.ProcurementProjectRepository.Query(p => projectIds.Contains(p.Id) && !p.IsDeleted),
            cancellationToken
        );

        var modes = await unitOfWork.ProcurementModeRepository.ToListAsync(
            unitOfWork.ProcurementModeRepository.Query(),
            cancellationToken
        );

        bool IsPublicBidding(ProcurementProject? p)
        {
            if (p == null) return false;
            if (p.ProcurementModeId.HasValue)
            {
                var m = modes.FirstOrDefault(mode => mode.Id == p.ProcurementModeId.Value);
                if (m != null)
                {
                    var name = m.Name.ToLowerInvariant();
                    if (name.Contains("public bidding") || name.Contains("competitive") || (name.Contains("bidding") && !name.Contains("small value")))
                    {
                        return true;
                    }
                    if (name.Contains("direct") || name.Contains("shopping") || name.Contains("small value") || name.Contains("emergency"))
                    {
                        return false;
                    }
                }
            }

            // Default to true for standard bidding resolutions
            return true;
        }

        var availableResolutions = allResolutions
            .Where(r =>
            {
                if (usedResolutionIds.Contains(r.Id)) return false;
                var project = projects.FirstOrDefault(p => p.Id == r.ProcurementProjectId);
                var isResolutionApproved = string.Equals(r.Status, "Approved", StringComparison.OrdinalIgnoreCase);
                var isProjectApproved = project != null && string.Equals(project.Status, "Approved", StringComparison.OrdinalIgnoreCase);
                return (isResolutionApproved || isProjectApproved) && IsPublicBidding(project);
            })
            .ToList();

        var cprIds = projects.Where(p => p.ConsolidatedPRId.HasValue).Select(p => p.ConsolidatedPRId!.Value).Distinct().ToList();
        var cprs = await unitOfWork.ConsolidatedPRRepository.ToListAsync(
            unitOfWork.ConsolidatedPRRepository.Query(c => cprIds.Contains(c.Id)),
            cancellationToken
        );
        var cprItems = await unitOfWork.ConsolidatedPRItemRepository.ToListAsync(
            unitOfWork.ConsolidatedPRItemRepository.Query(ci => cprIds.Contains(ci.ConsolidatedPRId)),
            cancellationToken
        );
        var prItemIds = cprItems.Select(ci => ci.PRItemId).Distinct().ToList();
        var prItems = await unitOfWork.PRItemRepository.ToListAsync(
            unitOfWork.PRItemRepository.Query(pi => prItemIds.Contains(pi.Id)),
            cancellationToken
        );

        var appItemIds = projects.Where(p => p.APPItemId.HasValue).Select(p => p.APPItemId!.Value).Distinct().ToList();
        var appItems = await unitOfWork.APPItemRepository.ToListAsync(
            unitOfWork.APPItemRepository.Query(ai => appItemIds.Contains(ai.Id)),
            cancellationToken
        );
        var ppmpItemIds = appItems.Select(ai => ai.PPMPItemId).Where(id => id != Guid.Empty).Distinct().ToList();
        var ppmpItems = await unitOfWork.PPMPItemRepository.ToListAsync(
            unitOfWork.PPMPItemRepository.Query(pi => ppmpItemIds.Contains(pi.Id)),
            cancellationToken
        );

        // Authoritative Public Bidding Award Recommendations
        var biddingAwardRecs = await unitOfWork.BiddingAwardRecommendationRepository.ToListAsync(
            unitOfWork.BiddingAwardRecommendationRepository.Query(a => projectIds.Contains(a.ProcurementProjectId) && !a.IsDeleted),
            cancellationToken
        );

        // Alternative modes (SVP/Shopping) AOB mappings
        var aobMappings = await unitOfWork.AOBProcurementProjectMappingRepository.ToListAsync(
            unitOfWork.AOBProcurementProjectMappingRepository.Query(m => projectIds.Contains(m.ProcurementProjectId)),
            cancellationToken
        );
        var aobIds = aobMappings.Select(m => m.AOBId).Distinct().ToList();
        var aobs = await unitOfWork.AOBRepository.ToListAsync(
            unitOfWork.AOBRepository.Query(a => aobIds.Contains(a.Id)),
            cancellationToken
        );
        var aobAwardedItems = await unitOfWork.AOBAwardedItemRepository.ToListAsync(
            unitOfWork.AOBAwardedItemRepository.Query(ai => aobIds.Contains(ai.AOBId)),
            cancellationToken
        );

        var suppliers = await unitOfWork.SupplierRepository.ToListAsync(
            unitOfWork.SupplierRepository.Query(),
            cancellationToken
        );

        var result = new List<AvailableAwardBacResolutionDto>();

        foreach (var res in availableResolutions)
        {
            var project = projects.FirstOrDefault(p => p.Id == res.ProcurementProjectId);
            var isBidding = IsPublicBidding(project);

            var cpr = project?.ConsolidatedPRId.HasValue == true ? cprs.FirstOrDefault(c => c.Id == project.ConsolidatedPRId.Value) : null;
            var projectItems = project?.ConsolidatedPRId.HasValue == true
                ? cprItems.Where(ci => ci.ConsolidatedPRId == project.ConsolidatedPRId.Value).ToList()
                : [];

            Guid supplierId = Guid.Empty;
            string supplierName = string.Empty;
            decimal awardedAmount = 0m;
            string awardCriterion = "LCRB";
            string? sourceAobNumber = null;

            if (isBidding)
            {
                // Authoritative Public Bidding Handshake:
                // Locate BiddingAwardRecommendation via direct FK or ProjectId
                var awardRec = res.BiddingAwardRecommendationId.HasValue
                    ? biddingAwardRecs.FirstOrDefault(a => a.Id == res.BiddingAwardRecommendationId.Value)
                    : biddingAwardRecs.FirstOrDefault(a => a.ProcurementProjectId == res.ProcurementProjectId);

                if (awardRec != null)
                {
                    var winningSupplier = suppliers.FirstOrDefault(s => s.Id == awardRec.WinningSupplierId);
                    supplierId = awardRec.WinningSupplierId;
                    supplierName = winningSupplier?.Name ?? "Winning Bidder";
                    awardedAmount = awardRec.AwardedAmount;
                    awardCriterion = awardRec.AwardCriterion;
                }
                else
                {
                    // Fallback to AOB mapping only if an authoritative AOB awarded item exists
                    var mapping = aobMappings.FirstOrDefault(m => m.ProcurementProjectId == res.ProcurementProjectId);
                    var aob = mapping != null ? aobs.FirstOrDefault(a => a.Id == mapping.AOBId) : null;
                    var winningItem = aob != null ? aobAwardedItems.FirstOrDefault(ai => ai.AOBId == aob.Id) : null;

                    if (winningItem == null)
                    {
                        // No post-qualification award recommendation or AOB awarded item found -> skip
                        continue;
                    }

                    var supplier = suppliers.FirstOrDefault(s => s.Id == winningItem.WinningSupplierId);
                    supplierId = supplier?.Id ?? Guid.Empty;
                    supplierName = supplier?.Name ?? "Winning Bidder";
                    awardedAmount = winningItem.TotalAwardedAmount;
                    awardCriterion = aob?.AwardCriterion.ToString() ?? "LCRB";
                    sourceAobNumber = aob?.AOBNumber;
                }
            }
            else
            {
                // Alternative SVP / Shopping Mode via AOB
                var mapping = aobMappings.FirstOrDefault(m => m.ProcurementProjectId == res.ProcurementProjectId);
                var aob = mapping != null ? aobs.FirstOrDefault(a => a.Id == mapping.AOBId) : null;
                var winningItem = aob != null ? aobAwardedItems.FirstOrDefault(ai => ai.AOBId == aob.Id) : null;

                if (winningItem == null) continue;

                var supplier = suppliers.FirstOrDefault(s => s.Id == winningItem.WinningSupplierId);
                supplierId = supplier?.Id ?? Guid.Empty;
                supplierName = supplier?.Name ?? "Winning Bidder";
                awardedAmount = winningItem.TotalAwardedAmount;
                awardCriterion = aob?.AwardCriterion.ToString() ?? "LCRB";
                sourceAobNumber = aob?.AOBNumber;
            }

            var lineItems = projectItems.Select(ci =>
            {
                var pi = prItems.FirstOrDefault(p => p.Id == ci.PRItemId);
                return new AwardedLineItemDto
                {
                    Id = ci.Id.ToString(),
                    ItemName = pi?.Name ?? "Procurement Package Item",
                    Category = "Goods & Services",
                    Description = pi?.Description ?? string.Empty,
                    Quantity = pi?.RequestedQuantity ?? 1,
                    Unit = "lot",
                    UnitPrice = pi?.UnitCost ?? 0,
                    Amount = pi?.Amount ?? 0
                };
            }).ToList();

            if (lineItems.Count == 0 && project?.APPItemId.HasValue == true)
            {
                var appItem = appItems.FirstOrDefault(a => a.Id == project.APPItemId.Value);
                var ppmpItem = appItem != null && appItem.PPMPItemId != Guid.Empty ? ppmpItems.FirstOrDefault(p => p.Id == appItem.PPMPItemId) : null;
                lineItems.Add(new AwardedLineItemDto
                {
                    Id = (appItem?.Id ?? Guid.NewGuid()).ToString(),
                    ItemName = ppmpItem?.Name ?? appItem?.Remarks ?? project.Title,
                    Category = "Goods & Services",
                    Description = ppmpItem?.Description ?? appItem?.Remarks ?? string.Empty,
                    Quantity = ppmpItem?.PlannedQuantity ?? 1,
                    Unit = !string.IsNullOrWhiteSpace(ppmpItem?.Unit) ? ppmpItem.Unit : "lot",
                    UnitPrice = ppmpItem?.UnitPrice ?? project.ABC,
                    Amount = appItem?.EffectiveABC ?? project.ABC
                });
            }

            var resolutionNumber = !string.IsNullOrWhiteSpace(res.ResolutionNumber)
                ? res.ResolutionNumber
                : $"BAC-RES-{res.DateResolved:yyyy-MM-dd}";

            var projectTitle = !string.IsNullOrWhiteSpace(project?.Title)
                ? project.Title
                : (!string.IsNullOrWhiteSpace(cpr?.CPRNumber) ? $"Procurement Project ({cpr.CPRNumber})" : "Procurement Project");

            result.Add(new AvailableAwardBacResolutionDto
            {
                Id = res.Id,
                BACResolutionNumber = resolutionNumber,
                ResolutionDate = DateOnly.FromDateTime(res.DateResolved),
                Description = projectTitle,
                ProcurementProjectId = res.ProcurementProjectId,
                ProjectName = projectTitle,
                ProjectDescription = project?.ScopeOfWork ?? string.Empty,
                PRNumber = cpr?.CPRNumber ?? string.Empty,
                EndUser = project?.EndUserRepresentative != null ? $"{project.EndUserRepresentative.FirstName} {project.EndUserRepresentative.LastName}" : "Procurement Office",
                ApprovedBudget = project?.ABC ?? 0,
                ModeOfProcurement = project?.ProcurementMode?.Name ?? "Public Bidding",
                SupplierId = supplierId,
                WinningSupplierName = supplierName,
                AwardedAmount = awardedAmount,
                AwardCriterion = awardCriterion,
                SourceAOBNumber = sourceAobNumber,
                LineItems = lineItems
            });
        }

        return ApiResponse<List<AvailableAwardBacResolutionDto>>.Success(result);
    }
}
