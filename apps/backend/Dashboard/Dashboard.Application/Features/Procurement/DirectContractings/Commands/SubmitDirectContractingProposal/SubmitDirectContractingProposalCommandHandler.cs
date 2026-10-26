using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.SubmitDirectContractingProposal;

public class SubmitDirectContractingProposalCommandHandler(IUnitOfWork unitOfWork)
: IRequestHandler<SubmitDirectContractingProposalCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(SubmitDirectContractingProposalCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        // 1. Fetch Direct Contracting request with BAC Project and source items
        var directContracting = await unitOfWork.DirectContractingRepository.Query()
            .Include(dc => dc.BACProject)
                .ThenInclude(p => p.ConsolidatedPR)
                    .ThenInclude(c => c!.ConsolidatedPRItems)
                        .ThenInclude(ci => ci.PRItem)
                            .ThenInclude(pri => pri.PPMPItem)
            .Include(dc => dc.BACProject)
                .ThenInclude(p => p.APPItemLinks)
                    .ThenInclude(l => l.APPItem)
                        .ThenInclude(ai => ai.PPMPItem)
                            .ThenInclude(pi => pi!.PPMPItemAllocations)
            .Include(dc => dc.BACProject)
                .ThenInclude(p => p.APPItem)
                    .ThenInclude(ai => ai!.PPMPItem)
                        .ThenInclude(pi => pi!.PPMPItemAllocations)
            .FirstOrDefaultAsync(dc => dc.Id == command.DirectContractingId && !dc.IsDeleted, cancellationToken);

        if (directContracting == null)
        {
            return ApiResponse<Guid>.Fail("Direct Contracting request not found.");
        }

        if (directContracting.Status != DirectContractingStatusEnum.FOR_REVIEW &&
            directContracting.Status != DirectContractingStatusEnum.SUBMITTED_TO_SUPPLIER)
        {
            return ApiResponse<Guid>.Fail($"Cannot submit a proposal for a DC request with status '{directContracting.Status}'.");
        }

        // 2. Validate Supplier is the assigned exclusive supplier (defaulting to ExclusiveSupplierId if Guid.Empty)
        var effectiveSupplierId = request.SupplierId != Guid.Empty
            ? request.SupplierId
            : directContracting.ExclusiveSupplierId;

        if (directContracting.ExclusiveSupplierId != effectiveSupplierId)
        {
            return ApiResponse<Guid>.Fail("Only the exclusive supplier assigned to this request can submit a proposal.");
        }

        // 3. Prevent duplicate submissions
        var existingProposal = await unitOfWork.DirectContractingProposalRepository.Query()
            .FirstOrDefaultAsync(p => p.DirectContractingId == directContracting.Id && !p.IsDeleted, cancellationToken);

        if (existingProposal != null)
        {
            return ApiResponse<Guid>.Fail("A proposal has already been submitted for this Direct Contracting request.");
        }

        // 4. Resolve expected items from BACProject
        var expectedItems = new Dictionary<Guid, (string Name, decimal UnitABC, int Quantity, Guid PPMPItemId)>();

        if (directContracting.BACProject != null)
        {
            if (directContracting.BACProject.SourceType == ProcurementProjectSourceType.ConsolidatedPR && directContracting.BACProject.ConsolidatedPR != null)
            {
                foreach (var ci in directContracting.BACProject.ConsolidatedPR.ConsolidatedPRItems.Where(x => !x.IsDeleted))
                {
                    if (ci.PRItem == null || ci.PRItem.IsDeleted) continue;
                    var canonicalId = ci.PRItem.PPMPItemId ?? ci.Id;
                    var ppmpId = ci.PRItem.PPMPItemId ?? ci.Id;
                    expectedItems[canonicalId] = (ci.PRItem.Name, ci.PRItem.UnitCost, ci.PRItem.RequestedQuantity, ppmpId);
                }
            }
            else if (directContracting.BACProject.SourceType == ProcurementProjectSourceType.APPItem)
            {
                var appItemList = new List<APPItem>();
                if (directContracting.BACProject.APPItemLinks != null && directContracting.BACProject.APPItemLinks.Count > 0)
                {
                    appItemList.AddRange(directContracting.BACProject.APPItemLinks
                        .Where(l => !l.IsDeleted && l.APPItem != null && !l.APPItem.IsDeleted)
                        .OrderBy(l => l.Order)
                        .Select(l => l.APPItem));
                }
                else if (directContracting.BACProject.APPItem != null && !directContracting.BACProject.APPItem.IsDeleted)
                {
                    appItemList.Add(directContracting.BACProject.APPItem);
                }

                foreach (var ai in appItemList)
                {
                    var ppmp = ai.PPMPItem;
                    int quantity = 1;
                    if (ppmp != null)
                    {
                        var allocSum = ppmp.PPMPItemAllocations != null && ppmp.PPMPItemAllocations.Any(a => !a.IsDeleted)
                            ? ppmp.PPMPItemAllocations.Where(a => !a.IsDeleted).Sum(a => a.Quantity)
                            : 0;
                        quantity = allocSum > 0 ? allocSum : (ppmp.PlannedQuantity > 0 ? ppmp.PlannedQuantity : 1);
                    }
                    decimal unitAbc = quantity > 0 ? (ai.EffectiveABC / quantity) : ai.EffectiveABC;
                    var canonicalId = ai.PPMPItemId != Guid.Empty ? ai.PPMPItemId : ai.Id;
                    var ppmpId = ai.PPMPItemId != Guid.Empty ? ai.PPMPItemId : ai.Id;
                    var name = !string.IsNullOrWhiteSpace(ai.ItemNameOverride) ? ai.ItemNameOverride : (ppmp?.Name ?? ai.Remarks ?? "APP Item");
                    expectedItems[canonicalId] = (name, unitAbc, quantity, ppmpId);
                }
            }
        }

        var itemsToProcess = request.ProposalItems.Count > 0 
            ? request.ProposalItems 
            : (request.QuotationItems ?? []);

        var exclusivityUrl = !string.IsNullOrWhiteSpace(request.ExclusivityDocumentUrl) 
            ? request.ExclusivityDocumentUrl 
            : (request.ExclusivityProofUrl ?? string.Empty);

        var proposalRemarks = !string.IsNullOrWhiteSpace(request.ProposalRemarks) 
            ? request.ProposalRemarks 
            : request.ProposalNotes;

        // All-or-Nothing check: ensure all expected items have a submitted bid
        if (expectedItems.Count > 0)
        {
            var submittedIds = itemsToProcess
                .Select(p => p.CPRItemId != Guid.Empty ? p.CPRItemId : (p.PrItemId ?? Guid.Empty))
                .Where(id => id != Guid.Empty)
                .ToHashSet();

            var missingItems = expectedItems
                .Where(e => !submittedIds.Contains(e.Key) && !submittedIds.Contains(e.Value.PPMPItemId))
                .Select(e => e.Value.Name)
                .ToList();

            if (missingItems.Count > 0)
            {
                return ApiResponse<Guid>.Fail($"All items in the Direct Contracting request must be bid on. Missing items: {string.Join(", ", missingItems)}.");
            }
        }

        // 5. Validate and construct proposal items
        var proposalItems = new List<DirectContractingProposalItem>();
        decimal totalProposalAmount = 0;

        foreach (var itemRequest in itemsToProcess)
        {
            var reqItemId = itemRequest.CPRItemId != Guid.Empty ? itemRequest.CPRItemId : (itemRequest.PrItemId ?? Guid.Empty);
            var unitBid = itemRequest.UnitBid > 0 ? itemRequest.UnitBid : (itemRequest.BidUnitPrice ?? 0);
            var brand = itemRequest.Brand ?? itemRequest.BidBrand;
            var model = itemRequest.Model ?? itemRequest.BidModel;
            var color = itemRequest.Color ?? itemRequest.BidColor;
            var brochure = itemRequest.BrochureFileUrl ?? itemRequest.BidBrochureUrl;

            string itemName;
            decimal unitAbc;
            int quantity;
            Guid cprItemIdToSave = reqItemId;

            if (expectedItems.TryGetValue(reqItemId, out var expected))
            {
                itemName = expected.Name;
                unitAbc = expected.UnitABC;
                quantity = expected.Quantity > 0 ? expected.Quantity : 1;
                cprItemIdToSave = expected.PPMPItemId;
            }
            else
            {
                // Fallback to querying PPMPItem repository
                var cprItem = await unitOfWork.PPMPItemRepository.GetByIdAsync(reqItemId, cancellationToken);
                if (cprItem == null)
                {
                    return ApiResponse<Guid>.Fail($"Item with ID {reqItemId} was not found.");
                }

                itemName = cprItem.Name;
                unitAbc = cprItem.UnitPrice;

                var allocations = await unitOfWork.PPMPItemAllocationRepository.Query()
                    .Where(a => a.PPMPItemId == cprItem.Id && !a.IsDeleted)
                    .ToListAsync(cancellationToken);

                quantity = allocations.Sum(a => a.Quantity);
                if (quantity <= 0)
                {
                    quantity = cprItem.PlannedQuantity > 0 ? cprItem.PlannedQuantity : 1;
                }
            }

            // Budget Check (ABC Validation): unit_bid against unit ABC
            if (unitBid > unitAbc)
            {
                return ApiResponse<Guid>.Fail($"Unit bid for item '{itemName}' ({unitBid:C}) exceeds the Approved Budget for the Contract (ABC) unit price ({unitAbc:C}).");
            }

            decimal totalBid = unitBid * quantity;
            totalProposalAmount += totalBid;

            proposalItems.Add(new DirectContractingProposalItem
            {
                CPRItemId = cprItemIdToSave,
                UnitBid = unitBid,
                TotalBid = totalBid,
                Brand = brand,
                Model = model,
                Color = color,
                BrochureFileUrl = brochure
            });
        }

        // Total proposal ABC check
        if (directContracting.TotalABC > 0 && totalProposalAmount > directContracting.TotalABC)
        {
            return ApiResponse<Guid>.Fail($"Total proposal amount ({totalProposalAmount:C}) exceeds the Direct Contracting Total ABC ({directContracting.TotalABC:C}).");
        }

        // 6. Create Proposal header record
        var proposal = new DirectContractingProposal
        {
            DirectContractingId = directContracting.Id,
            SupplierId = request.SupplierId != Guid.Empty ? request.SupplierId : directContracting.ExclusiveSupplierId,
            ExclusivityDocumentUrl = exclusivityUrl,
            ProposalRemarks = proposalRemarks,
            TotalProposalAmount = totalProposalAmount,
            SubmittedAt = DateTime.UtcNow
        };

        // Associate items
        foreach (var item in proposalItems)
        {
            proposal.ProposalItems.Add(item);
        }

        // 6. Update Direct Contracting header status
        directContracting.Status = ERPEZ.Domain.Enums.DirectContractingStatusEnum.PENDING_FOR_APPROVAL;

        await unitOfWork.DirectContractingProposalRepository.AddAsync(proposal, cancellationToken);
        unitOfWork.DirectContractingRepository.Update(directContracting);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(proposal.Id, "Supplier proposal submitted successfully for review.");
    }
}
