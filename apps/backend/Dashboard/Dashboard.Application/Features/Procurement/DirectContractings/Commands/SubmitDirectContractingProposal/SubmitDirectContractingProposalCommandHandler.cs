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
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.SubmitDirectContractingProposal;

public class SubmitDirectContractingProposalCommandHandler(IUnitOfWork unitOfWork)
: IRequestHandler<SubmitDirectContractingProposalCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(SubmitDirectContractingProposalCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        // 1. Fetch Direct Contracting request
        var directContracting = await unitOfWork.DirectContractingRepository.Query()
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

        // 2. Validate Supplier is the assigned exclusive supplier
        if (directContracting.ExclusiveSupplierId != request.SupplierId)
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

        // 4. Validate and construct proposal items
        var proposalItems = new List<DirectContractingProposalItem>();
        decimal totalProposalAmount = 0;

        foreach (var itemRequest in request.ProposalItems)
        {
            // Fetch the linked CPR Item (represented as PPMPItem in domain schema)
            var cprItem = await unitOfWork.PPMPItemRepository.GetByIdAsync(itemRequest.CPRItemId, cancellationToken);
            if (cprItem == null)
            {
                return ApiResponse<Guid>.Fail($"CPR Item with ID {itemRequest.CPRItemId} was not found.");
            }

            // Budget Check (ABC Validation): unit_bid against CPR item's unit_price (ABC)
            if (itemRequest.UnitBid > cprItem.UnitPrice)
            {
                return ApiResponse<Guid>.Fail($"Unit bid for item '{cprItem.Name}' ({itemRequest.UnitBid:C}) exceeds the Approved Budget for the Contract (ABC) unit price ({cprItem.UnitPrice:C}).");
            }

            // In our system, the quantity is retrieved from PPMPItem allocations sum.
            // Let's load the PPMP Item allocations to compute total quantity
            var allocations = await unitOfWork.PPMPItemAllocationRepository.Query()
                .Where(a => a.PPMPItemId == cprItem.Id && !a.IsDeleted)
                .ToListAsync(cancellationToken);

            int quantity = allocations.Sum(a => a.Quantity);
            if (quantity <= 0)
            {
                return ApiResponse<Guid>.Fail($"CPR item '{cprItem.Name}' has no quantity allocations. Please ensure PPMP allocations are complete before submitting.");
            }

            decimal totalBid = itemRequest.UnitBid * quantity;
            totalProposalAmount += totalBid;

            proposalItems.Add(new DirectContractingProposalItem
            {
                CPRItemId = itemRequest.CPRItemId,
                UnitBid = itemRequest.UnitBid,
                TotalBid = totalBid,
                Brand = itemRequest.Brand,
                Model = itemRequest.Model,
                Color = itemRequest.Color,
                BrochureFileUrl = itemRequest.BrochureFileUrl
            });
        }

        // 5. Create Proposal header record
        var proposal = new DirectContractingProposal
        {
            DirectContractingId = directContracting.Id,
            SupplierId = request.SupplierId,
            ExclusivityDocumentUrl = request.ExclusivityDocumentUrl,
            ProposalRemarks = request.ProposalRemarks,
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
