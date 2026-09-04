using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

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
            .GetWithPublicDetailsByIdAsync(request.ProjectId, cancellationToken)
            ?? throw new NotFoundException("Project not found.");

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
        var isDuplicate = await unitOfWork.PublicSupplierApplicationRepository
            .ExistsAsync(request.ProjectId, request.TinNumber, cancellationToken);

        if (isDuplicate)
            throw new FluentValidation.ValidationException(
                "An application with this TIN number has already been submitted for this project.");

        // ── 4. BUILD APPLICATION HEADER ───────────────────────────────────────────
        var application = new PublicSupplierApplication
        {
            ProcurementProjectId = request.ProjectId,
            CompanyName          = request.CompanyName,
            ContactPerson        = request.ContactPerson,
            EmailAddress         = request.EmailAddress,
            ContactNumber        = request.ContactNumber,
            TinNumber            = request.TinNumber,
            BusinessAddress      = request.BusinessAddress,
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
                ChecklistItemId  = doc.ChecklistItemId,
                BlobStorageUrl   = promoted.Url,
                OriginalFileName = promoted.OriginalFileName,
                UploadedAt       = DateTime.UtcNow
            });
        }

        // ── 6. PERSIST ────────────────────────────────────────────────────────────
        await unitOfWork.PublicSupplierApplicationRepository.AddAsync(application, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(application.Id, "Your application has been submitted successfully.");
    }
}
