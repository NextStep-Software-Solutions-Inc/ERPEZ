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
            var rfqSupplierRecord = await unitOfWork.SupplierRepository.FindAsync(
                s => s.TINNumber == trimmedTinRfq && !s.IsDeleted, cancellationToken);

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
                    CreatedBy = "PublicPortal"
                };
                await unitOfWork.SupplierRepository.AddAsync(rfqSupplierRecord, cancellationToken);
            }

            // Register supplier under RFQ invited/participating suppliers if not already present
            if (!rfq.RFQSuppliers.Any(s => s.SupplierId == rfqSupplierRecord.Id))
            {
                rfq.RFQSuppliers.Add(new RFQSupplier
                {
                    SupplierId = rfqSupplierRecord.Id,
                    InvitedAt = DateTime.UtcNow
                });
            }

            await unitOfWork.SaveChangesAsync(cancellationToken);

            return ApiResponse<Guid>.Success(Guid.NewGuid(), "Your application/quotation has been submitted successfully.");
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

        if (submissionSchedule != null && submissionSchedule.EndDate != default && DateTime.UtcNow > submissionSchedule.EndDate)
            throw new ForbiddenException(
                $"The submission deadline was {submissionSchedule.EndDate:MMMM dd, yyyy 'at' hh:mm tt} UTC. " +
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
            SubmittedAt          = DateTime.UtcNow
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
                CreatedBy        = "PublicPortal"
            });
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
                OriginalProposedAmount      = 0m,
                BidSecurityType             = "Bid Securing Declaration",
                SubmissionType              = "Electronic",
                SubmittedAt                 = application.SubmittedAt,
                CreatedBy                   = "PublicPortal"
            };

            await unitOfWork.BiddingSubmissionRepository.AddAsync(biddingSubmission, cancellationToken);
        }

        // ── 7. PERSIST ALL IN ONE TRANSACTION ────────────────────────────────────
        await unitOfWork.PublicSupplierApplicationRepository.AddAsync(application, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(application.Id, "Your application has been submitted successfully.");
    }
}
