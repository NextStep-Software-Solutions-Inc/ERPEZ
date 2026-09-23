using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ERPEZ.Application.Features.Procurement.SupplierPortal.Commands.ValidatePublicApplication;

public class ValidatePublicApplicationCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<ValidatePublicApplicationCommand, ApiResponse<bool>>
{
    private static readonly string[] allowedFallbackStatuses = ["Open", "ClosingSoon", "Published", "ROUTED_TO_PORTAL", "Active", "Posted"];

    public async Task<ApiResponse<bool>> Handle(
        ValidatePublicApplicationCommand request, CancellationToken cancellationToken)
    {
        // ── 1. LOAD PROJECT OR RFQ ────────────────────────────────────────────────
        var project = await unitOfWork.ProcurementProjectRepository
            .GetWithPublicDetailsByIdAsync(request.ProjectId, cancellationToken);

        if (project == null)
        {
            var rfq = await unitOfWork.RFQRepository.Query()
                .Include(r => r.RFQSuppliers)
                .Include(r => r.RFQItems)
                .FirstOrDefaultAsync(r => r.Id == request.ProjectId && !r.IsDeleted, cancellationToken);

            if (rfq == null)
                throw new NotFoundException("Project not found.");

            if (rfq.Status != StatusEnum.Approved)
                throw new ForbiddenException("This RFQ is not currently accepting public applications.");

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            if (rfq.Deadline.HasValue && rfq.Deadline.Value < today)
                throw new ForbiddenException("The submission deadline for this RFQ has passed.");

            // Supplier duplicate & blocked check
            var trimmedTinRfq = request.TinNumber?.Trim() ?? string.Empty;
            if (!string.IsNullOrWhiteSpace(trimmedTinRfq))
            {
                var rfqSupplierRecord = await unitOfWork.SupplierRepository.Query()
                    .FirstOrDefaultAsync(s => s.TINNumber == trimmedTinRfq && !s.IsDeleted, cancellationToken);

                if (rfqSupplierRecord != null)
                {
                    if (rfqSupplierRecord.IsBlocked)
                    {
                        throw new ForbiddenException("This supplier has been suspended or blacklisted.");
                    }

                    var existingBid = await unitOfWork.SupplierBidRepository.FindAsync(
                        b => b.RFQId == rfq.Id && b.SupplierId == rfqSupplierRecord.Id && !b.IsDeleted,
                        cancellationToken);

                    if (existingBid != null)
                    {
                        throw new FluentValidation.ValidationException(
                            "An application/quotation with this TIN number has already been submitted for this RFQ.");
                    }
                }
            }

            // ABC ceiling check
            var itemBidsDict = request.ItemBids?.ToDictionary(ib => ib.RFQItemId) ?? [];
            decimal totalQuoted = 0m;
            if (request.ProposedBidAmount.HasValue && request.ProposedBidAmount.Value > 0)
            {
                totalQuoted = request.ProposedBidAmount.Value;
            }
            else if (itemBidsDict.Count > 0)
            {
                totalQuoted = rfq.RFQItems
                    .Where(item => !item.IsDeleted && itemBidsDict.ContainsKey(item.Id))
                    .Sum(item => itemBidsDict[item.Id].UnitPrice * item.Quantity);
            }

            if (totalQuoted > 0 && rfq.TotalAmount > 0 && totalQuoted > rfq.TotalAmount)
            {
                throw new FluentValidation.ValidationException(
                    $"Your total quoted bid (₱{totalQuoted:N2}) exceeds the Approved Budget for the Contract (₱{rfq.TotalAmount:N2}). Under the New Government Procurement Act (NGPA / RA 12009) and applicable rules, bids exceeding the ABC cannot be accepted.");
            }

            // Checklist verification
            var requiredRfqChecklistIds = new List<Guid>
            {
                Guid.Parse("00000000-0000-0000-0000-000000000001"),
                Guid.Parse("00000000-0000-0000-0000-000000000002")
            };
            if (rfq.TotalAmount > 50000m)
            {
                requiredRfqChecklistIds.Add(Guid.Parse("00000000-0000-0000-0000-000000000003"));
            }
            requiredRfqChecklistIds.Add(rfq.Id);

            var submittedIds = (request.ChecklistItemIds ?? []).ToHashSet();
            var missingRfqItems = requiredRfqChecklistIds.Except(submittedIds).ToList();
            if (missingRfqItems.Count != 0)
            {
                throw new FluentValidation.ValidationException("Missing required documents. Please attach all required checklist items.");
            }

            return ApiResponse<bool>.Success(true, "Application is valid for submission.");
        }

        // ── 2. PROCUREMENT PROJECT VALIDATION ────────────────────────────────────
        var isPubliclyVisible = project.BiddingDocument is not null
            ? project.BiddingDocument.Status == "Posted"
            : allowedFallbackStatuses.Contains(project.Status);

        if (!isPubliclyVisible)
            throw new ForbiddenException("This project is not currently accepting public applications.");

        var submissionSchedule = project.BiddingActivitySchedules
            .FirstOrDefault(s => s.ProcurementActivityType?.SystemRole == ProcurementActivitySystemRole.SubmissionOpeningOfBids);

        var submissionDeadline = submissionSchedule != null
            ? (submissionSchedule.EndDate != default ? submissionSchedule.EndDate : submissionSchedule.StartDate)
            : (DateTime?)null;

        if (submissionDeadline.HasValue && DateTime.UtcNow > submissionDeadline.Value)
            throw new ForbiddenException(
                $"The submission deadline was {submissionDeadline.Value:MMMM dd, yyyy 'at' hh:mm tt} UTC. " +
                "This project is no longer accepting applications.");

        if (string.Equals(project.Status, "Closed", StringComparison.OrdinalIgnoreCase))
            throw new ForbiddenException("This project is closed and no longer accepting applications.");

        // Checklist validation
        var requiredItemIds = (await unitOfWork.ProjectDocumentChecklistRepository
            .GetByProjectIdAsync(request.ProjectId, cancellationToken))
            .Where(c => c.IsRequired)
            .Select(c => c.Id)
            .ToList();

        var submittedItemIds = (request.ChecklistItemIds ?? []).ToHashSet();
        var missingItems = requiredItemIds.Except(submittedItemIds).ToList();

        if (missingItems.Count != 0)
            throw new FluentValidation.ValidationException("Missing required documents. Please upload all required checklist items.");

        // Duplicate submission guard
        var trimmedTin = request.TinNumber?.Trim() ?? string.Empty;
        var isDuplicate = await unitOfWork.PublicSupplierApplicationRepository
            .ExistsAsync(request.ProjectId, trimmedTin, cancellationToken);

        if (isDuplicate)
            throw new FluentValidation.ValidationException("An application with this TIN number has already been submitted for this project.");

        // Supplier blocked guard
        var supplier = await unitOfWork.SupplierRepository.FindAsync(
            s => s.TINNumber == trimmedTin && !s.IsDeleted, cancellationToken);

        if (supplier != null && supplier.IsBlocked)
            throw new ForbiddenException("This supplier has been suspended or blacklisted.");

        // ABC ceiling check
        if (request.ProposedBidAmount.HasValue && project.ABC > 0 && request.ProposedBidAmount.Value > project.ABC)
        {
            throw new FluentValidation.ValidationException(
                $"Your proposed bid (₱{request.ProposedBidAmount.Value:N2}) exceeds the Approved Budget for the Contract (₱{project.ABC:N2}). Under the New Government Procurement Act (NGPA / RA 12009) and applicable rules, bids exceeding the ABC cannot be accepted.");
        }

        return ApiResponse<bool>.Success(true, "Application is valid for submission.");
    }
}
