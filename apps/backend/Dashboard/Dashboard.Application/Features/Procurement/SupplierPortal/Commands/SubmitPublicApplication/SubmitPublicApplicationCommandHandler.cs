using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.SupplierPortal.Commands.SubmitPublicApplication;

public class SubmitPublicApplicationCommandHandler(
    IUnitOfWork         unitOfWork,
    IFileStorageService fileStorageService)
    : IRequestHandler<SubmitPublicApplicationCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        SubmitPublicApplicationCommand request, CancellationToken cancellationToken)
    {
        // ── 1. LOAD PROJECT (with schedules + PBD gate) ───────────────────────────
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

            // Find or create supplier
            var trimmedTinRfq = request.TinNumber.Trim();
            var rfqSupplierRecord = await unitOfWork.SupplierRepository.Query()
                .Include(s => s.SupplierRequirements)
                .FirstOrDefaultAsync(s => s.TINNumber == trimmedTinRfq && !s.IsDeleted, cancellationToken);

            if (rfqSupplierRecord == null)
            {
                var defaultCategory = await unitOfWork.SupplierCategoryRepository.FindAsync(
                    c => !c.IsDeleted, cancellationToken);

                rfqSupplierRecord = new ERPEZ.Domain.Entities.Planning.Supplier
                {
                    Id = Guid.NewGuid(),
                    Name = request.CompanyName.Trim(),
                    TINNumber = trimmedTinRfq,
                    BusinessPermitNo = $"BP-PORTAL-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}",
                    SupplierCategoryId = defaultCategory?.Id ?? Guid.Empty,
                    ContactPerson = request.ContactPerson.Trim(),
                    ContactNumber = request.ContactNumber.Trim(),
                    Email = request.EmailAddress.Trim(),
                    Address = request.BusinessAddress.Trim(),
                    Status = "Pending",
                    IsBlocked = false,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "PublicPortal"
                };
                await unitOfWork.SupplierRepository.AddAsync(rfqSupplierRecord, cancellationToken);
            }
            else
            {
                // Guard against duplicate submission for the same RFQ
                var existingBid = await unitOfWork.SupplierBidRepository.FindAsync(
                    b => b.RFQId == rfq.Id && b.SupplierId == rfqSupplierRecord.Id && !b.IsDeleted,
                    cancellationToken);

                if (existingBid != null)
                {
                    throw new FluentValidation.ValidationException(
                        "An application/quotation with this TIN number has already been submitted for this RFQ.");
                }
            }

            // Promote uploaded documents (temp -> permanent storage) and attach as SupplierRequirements
            string? quotationUrl = null;
            if (request.Documents != null && request.Documents.Count > 0)
            {
                foreach (var doc in request.Documents)
                {
                    (string Url, string OriginalFileName) promoted;
                    try
                    {
                        promoted = await fileStorageService.PromoteFileAsync(doc.FileId, cancellationToken);
                    }
                    catch (FileNotFoundException)
                    {
                        throw new FluentValidation.ValidationException(
                            $"Uploaded file with ID '{doc.FileId}' was not found or has expired. Please re-upload and try again.");
                    }

                    string docName;
                    if (doc.ChecklistItemId == Guid.Parse("00000000-0000-0000-0000-000000000001"))
                        docName = "Valid Mayor's / Business Permit";
                    else if (doc.ChecklistItemId == Guid.Parse("00000000-0000-0000-0000-000000000002"))
                        docName = "PhilGEPS Registration Certificate";
                    else if (doc.ChecklistItemId == Guid.Parse("00000000-0000-0000-0000-000000000003"))
                        docName = "Omnibus Sworn Statement (GPPB Prescribed Form)";
                    else if (doc.ChecklistItemId == rfq.Id)
                    {
                        docName = $"Price Quotation Form - {rfq.RFQNumber}";
                        quotationUrl = promoted.Url;
                    }
                    else
                    {
                        docName = !string.IsNullOrWhiteSpace(promoted.OriginalFileName)
                            ? promoted.OriginalFileName
                            : "Quotation Attachment";
                    }

                    var req = new ERPEZ.Domain.Entities.Planning.SupplierRequirement
                    {
                        Id = Guid.NewGuid(),
                        SupplierId = rfqSupplierRecord.Id,
                        RequirementName = docName,
                        Url = promoted.Url,
                        IsVerified = false,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = "PublicPortal"
                    };
                    rfqSupplierRecord.SupplierRequirements.Add(req);
                    await unitOfWork.SupplierRequirementRepository.AddAsync(req, cancellationToken);
                }
            }

            // Register supplier under RFQ invited/participating suppliers if not already present
            if (!rfq.RFQSuppliers.Any(s => s.SupplierId == rfqSupplierRecord.Id))
            {
                var rfqSupplier = new RFQSupplier
                {
                    Id = Guid.NewGuid(),
                    RFQId = rfq.Id,
                    SupplierId = rfqSupplierRecord.Id,
                    InvitedAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "PublicPortal"
                };
                rfq.RFQSuppliers.Add(rfqSupplier);
                await unitOfWork.RFQSupplierRepository.AddAsync(rfqSupplier, cancellationToken);
            }

            // Create SupplierBid for the RFQ
            var itemBidsDict = request.ItemBids?.ToDictionary(ib => ib.RFQItemId) ?? new Dictionary<Guid, PublicItemBidDto>();

            // Calculate total quoted amount
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
                    $"Your total quoted bid (₱{totalQuoted:N2}) exceeds the Approved Budget for the Contract (₱{rfq.TotalAmount:N2}). Under RA 9184, bids exceeding the ABC cannot be accepted.");
            }

            var bidItems = new List<SupplierBidItem>();
            foreach (var item in rfq.RFQItems.Where(item => !item.IsDeleted))
            {
                itemBidsDict.TryGetValue(item.Id, out var itemBid);
                string? itemBrochureUrl = quotationUrl;

                if (itemBid?.BrochureFileId != null)
                {
                    try
                    {
                        var promotedBrochure = await fileStorageService.PromoteFileAsync(itemBid.BrochureFileId.Value, cancellationToken);
                        itemBrochureUrl = promotedBrochure.Url;
                    }
                    catch (FileNotFoundException)
                    {
                        // Fall back to quotationUrl if brochure promotion fails
                    }
                }

                var unitPrice = itemBid?.UnitPrice ?? 0m;
                bidItems.Add(new SupplierBidItem
                {
                    Id = Guid.NewGuid(),
                    RFQItemId = item.Id,
                    UnitPrice = unitPrice,
                    TotalPrice = unitPrice * item.Quantity,
                    Brand = itemBid?.Brand,
                    Model = itemBid?.Model,
                    Color = itemBid?.Color,
                    IsResponsive = true,
                    BrochureFileUrl = itemBrochureUrl,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "PublicPortal"
                });
            }

            var newBid = new SupplierBid
            {
                Id = Guid.NewGuid(),
                RFQId = rfq.Id,
                SupplierId = rfqSupplierRecord.Id,
                SubmissionType = "PublicPortal",
                Status = "Submitted",
                SubmittedAt = DateTime.UtcNow,
                Remarks = request.Remarks ?? $"Applied via BAC Public Portal ({request.CompanyName.Trim()})",
                TotalAmount = totalQuoted,
                DeliveryPeriod = request.DeliveryPeriod ?? rfq.DeliveryPeriod,
                PaymentTerms = request.PaymentTerms,
                WarrantyTerms = request.WarrantyTerms,
                ValidityPeriodDays = request.ValidityPeriodDays,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "PublicPortal",
                SupplierBidItems = bidItems
            };

            foreach (var bi in bidItems)
            {
                bi.SupplierBidId = newBid.Id;
            }

            await unitOfWork.SupplierBidRepository.AddAsync(newBid, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return ApiResponse<Guid>.Success(newBid.Id, "Your application/quotation has been submitted successfully.");
        }

        var allowedFallbackStatuses = new[] { "Open", "ClosingSoon", "Published", "ROUTED_TO_PORTAL", "Active", "Posted" };
        var isPubliclyVisible = project.BiddingDocument is not null
            ? project.BiddingDocument.Status == "Posted"
            : allowedFallbackStatuses.Contains(project.Status);

        if (!isPubliclyVisible)
            throw new ForbiddenException(
                "This project is not currently accepting public applications.");

        // ── 2. DEADLINE ENFORCEMENT ───────────────────────────────────────────────
        var submissionSchedule = project.BiddingActivitySchedules
            .FirstOrDefault(s => s.ProcurementActivityType?.SystemRole == ProcurementActivitySystemRole.SubmissionOpeningOfBids);

        var submissionDeadline = submissionSchedule != null
            ? (submissionSchedule.EndDate != default ? submissionSchedule.EndDate : submissionSchedule.StartDate)
            : (DateTime?)null;

        if (submissionDeadline.HasValue && DateTime.UtcNow > submissionDeadline.Value)
            throw new ForbiddenException(
                $"The submission deadline was {submissionDeadline.Value:MMMM dd, yyyy 'at' hh:mm tt} UTC. " +
                "This project is no longer accepting applications.");

        if (project.Status == "Closed")
            throw new ForbiddenException(
                "This project is closed and no longer accepting applications.");

        // ── 3. CHECKLIST VALIDATION ───────────────────────────────────────────────
        var requiredItemIds = (await unitOfWork.ProjectDocumentChecklistRepository
            .GetByProjectIdAsync(request.ProjectId, cancellationToken))
            .Where(c => c.IsRequired)
            .Select(c => c.Id)
            .ToList();

        var submittedItemIds = request.Documents.Select(d => d.ChecklistItemId).ToHashSet();
        var missingItems     = requiredItemIds.Except(submittedItemIds).ToList();

        if (missingItems.Count != 0)
            throw new FluentValidation.ValidationException(
                "Missing required documents. Please upload all required checklist items.");

        // ── 3b. DUPLICATE SUBMISSION GUARD ───────────────────────────────────────
        var trimmedTin = request.TinNumber.Trim();
        var isDuplicate = await unitOfWork.PublicSupplierApplicationRepository
            .ExistsAsync(request.ProjectId, trimmedTin, cancellationToken);

        if (isDuplicate)
            throw new FluentValidation.ValidationException(
                "An application with this TIN number has already been submitted for this project.");

        // ── 3c. FIND OR CREATE SUPPLIER MASTER RECORD ─────────────────────────────
        var supplier = await unitOfWork.SupplierRepository.FindAsync(
            s => s.TINNumber == trimmedTin && !s.IsDeleted, cancellationToken);

        if (supplier == null)
        {
            var defaultCategory = await unitOfWork.SupplierCategoryRepository.FindAsync(
                c => !c.IsDeleted, cancellationToken);

            supplier = new ERPEZ.Domain.Entities.Planning.Supplier
            {
                Id = Guid.NewGuid(),
                Name = request.CompanyName.Trim(),
                TINNumber = trimmedTin,
                BusinessPermitNo = $"BP-PORTAL-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}",
                SupplierCategoryId = defaultCategory?.Id ?? Guid.Empty,
                ContactPerson = request.ContactPerson.Trim(),
                ContactNumber = request.ContactNumber.Trim(),
                Email = request.EmailAddress.Trim(),
                Address = request.BusinessAddress.Trim(),
                Status = "Pending",
                IsBlocked = false,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "PublicPortal"
            };
            await unitOfWork.SupplierRepository.AddAsync(supplier, cancellationToken);
        }

        // ── 4. BUILD APPLICATION HEADER ───────────────────────────────────────────
        var application = new PublicSupplierApplication
        {
            Id                   = Guid.NewGuid(),
            ProcurementProjectId = request.ProjectId,
            CompanyName          = request.CompanyName.Trim(),
            ContactPerson        = request.ContactPerson.Trim(),
            EmailAddress         = request.EmailAddress.Trim(),
            ContactNumber        = request.ContactNumber.Trim(),
            TinNumber            = trimmedTin,
            BusinessAddress      = request.BusinessAddress.Trim(),
            Status               = "Submitted",
            SubmittedAt          = DateTime.UtcNow,
            CreatedAt            = DateTime.UtcNow,
            CreatedBy            = "PublicPortal"
        };

        // ── 5. PROMOTE EACH FILE: temp → permanent ────────────────────────────────
        foreach (var doc in request.Documents)
        {
            (string Url, string OriginalFileName) promoted;
            try
            {
                promoted = await fileStorageService.PromoteFileAsync(doc.FileId, cancellationToken);
            }
            catch (FileNotFoundException)
            {
                throw new FluentValidation.ValidationException(
                    $"Uploaded file with ID '{doc.FileId}' was not found or has expired. Please re-upload and try again.");
            }

            application.UploadedDocuments.Add(new ApplicationUploadedDocument
            {
                Id               = Guid.NewGuid(),
                ApplicationId    = application.Id,
                ChecklistItemId  = doc.ChecklistItemId,
                BlobStorageUrl   = promoted.Url,
                OriginalFileName = promoted.OriginalFileName,
                UploadedAt       = DateTime.UtcNow,
                CreatedAt        = DateTime.UtcNow,
                CreatedBy        = "PublicPortal"
            });
        }

        // ── 5b. ABC CEILING VALIDATION (RA 9184 Section 31) ──────────────────────
        if (request.ProposedBidAmount.HasValue && project.ABC > 0 && request.ProposedBidAmount.Value > project.ABC)
        {
            throw new FluentValidation.ValidationException(
                $"Your proposed bid amount (₱{request.ProposedBidAmount.Value:N2}) exceeds the Approved Budget for the Contract (₱{project.ABC:N2}). Under RA 9184, bids exceeding the ABC cannot be accepted.");
        }

        // ── 6. CONDITIONAL BIDDING SUBMISSION (Competitive / Public Bidding Only) ──
        var modeName = project.ProcurementMode?.Name?.ToLowerInvariant() ?? string.Empty;
        var isCompetitiveBidding = (modeName.Contains("competitive") || modeName.Contains("public bidding") || modeName.Contains("bidding"))
            && !modeName.Contains("small value")
            && !modeName.Contains("svp");

        if (isCompetitiveBidding)
        {
            var existingSubmission = await unitOfWork.BiddingSubmissionRepository.FindAsync(
                bs => bs.ProcurementProjectId == request.ProjectId && bs.SupplierId == supplier.Id && !bs.IsDeleted,
                cancellationToken);

            if (existingSubmission != null)
            {
                throw new FluentValidation.ValidationException(
                    "A bidding submission has already been registered for this supplier under this project.");
            }

            var biddingSubmission = new BiddingSubmission
            {
                Id                          = Guid.NewGuid(),
                ProcurementProjectId        = request.ProjectId,
                SupplierId                  = supplier.Id,
                PublicSupplierApplicationId = application.Id,
                OriginalProposedAmount      = request.ProposedBidAmount ?? 0m,
                BidSecurityType             = request.BidSecurityType ?? "Bid Securing Declaration",
                BidSecurityAmount           = request.BidSecurityAmount,
                BidSecurityNumber           = request.BidSecurityNumber,
                BidSecurityValidityDays     = request.BidSecurityValidityDays,
                SubmissionType              = "Electronic",
                SubmittedAt                 = application.SubmittedAt,
                Remarks                     = request.Remarks,
                CreatedAt                   = DateTime.UtcNow,
                CreatedBy                   = "PublicPortal"
            };

            await unitOfWork.BiddingSubmissionRepository.AddAsync(biddingSubmission, cancellationToken);
        }
        else
        {
            // ── 6b. CONDITIONAL RFQ BID SUBMISSION (SVP / Alternative Methods with Associated RFQ) ──
            var associatedRfq = await unitOfWork.RFQRepository.Query()
                .Include(r => r.RFQSuppliers)
                .Include(r => r.RFQItems)
                .FirstOrDefaultAsync(r =>
                    (project.ConsolidatedPRId.HasValue && r.ConsolidatedPRId == project.ConsolidatedPRId.Value)
                    || (project.ContractNo != null && r.RFQNumber.Contains(project.ContractNo))
                    || (project.ContractNo != null && r.TracingNumber.Contains(project.ContractNo)),
                    cancellationToken);

            if (associatedRfq != null)
            {
                if (!associatedRfq.RFQSuppliers.Any(s => s.SupplierId == supplier.Id))
                {
                    var rfqSupplier = new RFQSupplier
                    {
                        Id = Guid.NewGuid(),
                        RFQId = associatedRfq.Id,
                        SupplierId = supplier.Id,
                        InvitedAt = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = "PublicPortal"
                    };
                    associatedRfq.RFQSuppliers.Add(rfqSupplier);
                    await unitOfWork.RFQSupplierRepository.AddAsync(rfqSupplier, cancellationToken);
                }

                // Guard against duplicate bid for the same associated RFQ
                var existingRfqBid = await unitOfWork.SupplierBidRepository.FindAsync(
                    b => b.RFQId == associatedRfq.Id && b.SupplierId == supplier.Id && !b.IsDeleted,
                    cancellationToken);

                if (existingRfqBid != null)
                {
                    throw new FluentValidation.ValidationException(
                        "An application/quotation has already been submitted for the RFQ associated with this project.");
                }

                var itemBidsDict = request.ItemBids?.ToDictionary(ib => ib.RFQItemId) ?? new Dictionary<Guid, PublicItemBidDto>();
                decimal totalQuoted = request.ProposedBidAmount ?? 0m;
                if (totalQuoted == 0 && itemBidsDict.Count > 0)
                {
                    totalQuoted = associatedRfq.RFQItems
                        .Where(item => !item.IsDeleted && itemBidsDict.ContainsKey(item.Id))
                        .Sum(item => itemBidsDict[item.Id].UnitPrice * item.Quantity);
                }

                var bidItems = new List<SupplierBidItem>();
                foreach (var item in associatedRfq.RFQItems.Where(item => !item.IsDeleted))
                {
                    itemBidsDict.TryGetValue(item.Id, out var itemBid);
                    string? itemBrochureUrl = null;
                    if (itemBid?.BrochureFileId != null)
                    {
                        try
                        {
                            var promotedBrochure = await fileStorageService.PromoteFileAsync(itemBid.BrochureFileId.Value, cancellationToken);
                            itemBrochureUrl = promotedBrochure.Url;
                        }
                        catch (FileNotFoundException) { }
                    }

                    var unitPrice = itemBid?.UnitPrice ?? 0m;
                    bidItems.Add(new SupplierBidItem
                    {
                        Id = Guid.NewGuid(),
                        RFQItemId = item.Id,
                        UnitPrice = unitPrice,
                        TotalPrice = unitPrice * item.Quantity,
                        Brand = itemBid?.Brand,
                        Model = itemBid?.Model,
                        Color = itemBid?.Color,
                        IsResponsive = true,
                        BrochureFileUrl = itemBrochureUrl,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = "PublicPortal"
                    });
                }

                var newBid = new SupplierBid
                {
                    Id = Guid.NewGuid(),
                    RFQId = associatedRfq.Id,
                    SupplierId = supplier.Id,
                    SubmissionType = "PublicPortal",
                    Status = "Submitted",
                    SubmittedAt = application.SubmittedAt,
                    Remarks = request.Remarks ?? $"Applied via BAC Public Portal ({request.CompanyName.Trim()})",
                    TotalAmount = totalQuoted,
                    DeliveryPeriod = request.DeliveryPeriod ?? associatedRfq.DeliveryPeriod,
                    PaymentTerms = request.PaymentTerms,
                    WarrantyTerms = request.WarrantyTerms,
                    ValidityPeriodDays = request.ValidityPeriodDays,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "PublicPortal",
                    SupplierBidItems = bidItems
                };

                foreach (var bi in bidItems)
                {
                    bi.SupplierBidId = newBid.Id;
                }

                await unitOfWork.SupplierBidRepository.AddAsync(newBid, cancellationToken);
            }
        }

        // ── 7. PERSIST ALL IN ONE TRANSACTION ────────────────────────────────────
        await unitOfWork.PublicSupplierApplicationRepository.AddAsync(application, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(application.Id, "Your application has been submitted successfully.");
    }
}
