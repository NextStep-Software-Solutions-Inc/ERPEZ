using ERPEZ.Application.Features.Procurement.SupplierPortal.Commands.SubmitPublicApplication;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Commands.ValidatePublicApplication;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Dtos;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetBidNoticeDownloadUrl;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetPublicApplicationStatus;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetPublicProjectDetail;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetPublicProjects;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetPublicProjectStats;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ERPEZ.Application.Interfaces;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.GenerateRFQDocument;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using System.IO;
using System.Linq;
using System.Collections.Generic;

namespace ERPEZ.Api.Controllers;

/// <summary>
/// Public-facing controller for BAC Procurement Opportunities, Project Details, Bid Notices, and Supplier Applications.
/// </summary>
[Route("api/public")]
[ApiController]
[AllowAnonymous]
public class PublicProjectsController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Get aggregated metrics for public procurement opportunities (Active, Public Bidding, SVP, Closing Soon, Closed).
    /// </summary>
    [HttpGet("projects/stats")]
    [ProducesResponseType(typeof(ApiResponse<PublicProjectStatsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProjectStats()
    {
        var result = await mediator.Send(new GetPublicProjectStatsQuery());
        return Ok(result);
    }

    /// <summary>
    /// Get paginated list of public procurement projects.
    /// </summary>
    [HttpGet("projects")]
    [ProducesResponseType(typeof(PaginatedApiResponse<PublicProjectListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProjects([FromQuery] GetPublicProjectsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get detailed information for a single public project including document checklists and bid notices.
    /// </summary>
    [HttpGet("projects/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<PublicProjectDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProjectById(Guid id)
    {
        var result = await mediator.Send(new GetPublicProjectDetailQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Download a project bid notice template file.
    /// Streams the actual document file with preserved filename and appropriate content-type.
    /// </summary>
    [HttpGet("projects/{id:guid}/bid-notices/{checklistItemId:guid}/download")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DownloadBidNotice(
        Guid id,
        Guid checklistItemId,
        [FromServices] IFileStorageService fileStorageService,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetBidNoticeDownloadUrlQuery(id, checklistItemId), cancellationToken);
        if (!result.Succeeded || string.IsNullOrWhiteSpace(result.Data))
            return NotFound(ApiResponse<object>.Fail("Bid notice template not found."));

        var fileUrl = result.Data;

        // Try extracting Guid fileId from /files/download/{fileId} or raw Guid string
        Guid fileId = Guid.Empty;
        var segments = fileUrl.TrimEnd('/').Split('/');
        var lastSegment = segments.Last();
        if (!Guid.TryParse(lastSegment, out fileId))
        {
            foreach (var segment in segments)
            {
                if (Guid.TryParse(segment, out fileId))
                    break;
            }
        }

        if (fileId != Guid.Empty)
        {
            var fileInfo = await fileStorageService.GetFileAsync(fileId, cancellationToken);
            if (fileInfo != null)
            {
                var (fileName, stream) = fileInfo.Value;
                var underscoreIndex = fileName.IndexOf('_');
                var displayName = underscoreIndex >= 0 ? fileName[(underscoreIndex + 1)..] : fileName;
                var contentType = GetContentType(fileName);
                Response.Headers["Content-Disposition"] = $"inline; filename=\"{displayName}\"";
                return File(stream, contentType, displayName);
            }
        }

        // If fileUrl is an external link, redirect directly
        if (Uri.TryCreate(fileUrl, UriKind.Absolute, out var uriResult) 
            && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps))
        {
            return Redirect(fileUrl);
        }

        return NotFound(ApiResponse<object>.Fail("File could not be retrieved from storage."));
    }

    /// <summary>
    /// Download official RFQ document (PDF) for an approved RFQ opportunity on the public portal.
    /// </summary>
    [HttpGet("projects/{id:guid}/rfq-document")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DownloadPublicRfqDocument(
        Guid id,
        [FromServices] IUnitOfWork unitOfWork,
        [FromServices] IDocumentStorageService storageService,
        CancellationToken cancellationToken)
    {
        var rfq = await unitOfWork.RFQRepository.GetByIdAsync(id, cancellationToken);
        if (rfq == null || rfq.Status != StatusEnum.Approved)
        {
            return NotFound(ApiResponse<object>.Fail("Approved RFQ not found."));
        }

        // Check if a public blank RFQ document was already generated (excluding supplier-specific documents)
        var existingDoc = await unitOfWork.GeneratedDocumentRepository.FindAsync(
            d => d.SourceDocumentId == id 
                && d.DocumentType == DocumentType.Rfq 
                && !d.IsDeleted 
                && !d.FileName.Contains("_Supplier_"),
            cancellationToken);

        Guid documentId;
        if (existingDoc != null)
        {
            documentId = existingDoc.Id;
        }
        else
        {
            var genResult = await mediator.Send(new GenerateRFQDocumentCommand
            {
                RFQId = id,
                Format = ExportFormat.Pdf,
                BlankTemplate = true,
                GeneratedBy = "PublicPortal"
            }, cancellationToken);

            if (!genResult.Succeeded)
            {
                return NotFound(ApiResponse<object>.Fail(genResult.Message ?? "Failed to generate RFQ document."));
            }
            documentId = genResult.Data;
        }

        var doc = await unitOfWork.GeneratedDocumentRepository.FindAsync(d => d.Id == documentId, cancellationToken);
        if (doc == null)
            return NotFound(ApiResponse<object>.Fail("Document record not found."));

        var bytes = await storageService.GetAsync(doc.StoragePath, cancellationToken);
        var fileName = doc.FileName ?? $"RFQ_{rfq.RFQNumber}.pdf";
        Response.Headers["Content-Disposition"] = $"inline; filename=\"{fileName}\"";
        return File(bytes, "application/pdf", fileName);
    }

    private static string GetContentType(string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return extension switch
        {
            ".pdf" => "application/pdf",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xls" => "application/vnd.ms-excel",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".ppt" => "application/vnd.ms-powerpoint",
            ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            ".txt" => "text/plain",
            ".jpg" => "image/jpeg",
            ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".zip" => "application/zip",
            _ => "application/octet-stream"
        };
    }

    /// <summary>
    /// Pre-flight validation for public supplier application prior to file uploading.
    /// Prevents storage exhaustion if the project is closed, deadline passed, duplicate TIN, or over ABC.
    /// </summary>
    [HttpPost("projects/{id:guid}/validate-application")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ValidateApplication(Guid id, [FromBody] ValidatePublicApplicationRequest request)
    {
        var command = new ValidatePublicApplicationCommand(
            id,
            request.CompanyName,
            request.ContactPerson,
            request.EmailAddress,
            request.ContactNumber,
            request.TinNumber,
            request.BusinessAddress,
            request.ChecklistItemIds,
            request.ProposedBidAmount,
            request.DeliveryPeriod,
            request.PaymentTerms,
            request.WarrantyTerms,
            request.ValidityPeriodDays,
            request.Remarks,
            request.BidSecurityType,
            request.BidSecurityAmount,
            request.BidSecurityNumber,
            request.BidSecurityValidityDays,
            request.ItemBids
        );

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Generate a pre-filled RFQ quotation document (PDF) populated with the public applicant's current quotation data.
    /// This allows the supplier to preview or download the filled RFQ, apply signature/stamp, and attach it to their application.
    /// </summary>
    [HttpPost("projects/{id:guid}/generate-quotation")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GeneratePublicQuotation(
        Guid id,
        [FromBody] ValidatePublicApplicationRequest request,
        [FromServices] IUnitOfWork unitOfWork,
        [FromServices] IRFQDocumentContextService rfqContextService,
        [FromServices] IDocumentRendererService rendererService,
        CancellationToken cancellationToken)
    {
        var rfq = await unitOfWork.RFQRepository.GetRFQWithDetailsAsync(id, cancellationToken);
        if (rfq == null)
        {
            var project = await unitOfWork.ProcurementProjectRepository.GetByIdAsync(id, cancellationToken);
            if (project?.ConsolidatedPRId != null)
            {
                rfq = await unitOfWork.RFQRepository.FindAsync(
                    r => r.ConsolidatedPRId == project.ConsolidatedPRId && !r.IsDeleted,
                    cancellationToken);
                if (rfq != null)
                {
                    rfq = await unitOfWork.RFQRepository.GetRFQWithDetailsAsync(rfq.Id, cancellationToken);
                }
            }
        }

        if (rfq == null)
        {
            return NotFound(ApiResponse<object>.Fail("RFQ opportunity not found."));
        }

        Guid officeId = Guid.Empty;
        var prOfficeId = rfq.RFQItems?
            .Select(i => i.CPRItem?.PurchaseRequest?.OfficeId ?? i.CPRItem?.PRItem?.PurchaseRequest?.OfficeId)
            .FirstOrDefault(oid => oid.HasValue && oid.Value != Guid.Empty);
        if (prOfficeId.HasValue) officeId = prOfficeId.Value;
        if (officeId == Guid.Empty)
        {
            var defaultOffice = await unitOfWork.OfficeRepository.FindAsync(o => !o.IsDeleted, cancellationToken)
                ?? await unitOfWork.OfficeRepository.FindAsync(o => true, cancellationToken);
            if (defaultOffice != null) officeId = defaultOffice.Id;
        }

        var ctx = await rfqContextService.ResolveAsync(rfq.RFQNumber, rfq.Id, officeId, cancellationToken);

        var projectName = !string.IsNullOrWhiteSpace(rfq.Description)
            ? rfq.Description.Trim()
            : (!string.IsNullOrWhiteSpace(rfq.Purpose) ? rfq.Purpose.Trim() : "[Project Name / Purpose]");

        var modeName = !string.IsNullOrWhiteSpace(rfq.ModeOfProcurement?.Name)
            ? rfq.ModeOfProcurement.Name.Trim()
            : "[Mode of Procurement]";

        var dateFormatted = rfq.Date != default
            ? rfq.Date.ToString("MMMM dd, yyyy")
            : DateTime.UtcNow.ToString("MMMM dd, yyyy");

        var deadlineFormatted = rfq.Deadline.HasValue
            ? rfq.Deadline.Value.ToString("dddd, MMMM dd, yyyy 'at 12:00 noon'")
            : "[Deadline Date]";

        var prNumber = !string.IsNullOrWhiteSpace(rfq.ConsolidatedPR?.CPRNumber)
            ? rfq.ConsolidatedPR.CPRNumber.Trim()
            : (!string.IsNullOrWhiteSpace(rfq.TracingNumber) ? rfq.TracingNumber.Trim() : "[PR / Tracing No.]");

        var itemBidsDict = request.ItemBids?.ToDictionary(b => b.RFQItemId) ?? new Dictionary<Guid, PublicItemBidDto>();

        var rawRfqItems = (rfq.RFQItems ?? []).Where(i => !i.IsDeleted).ToList();
        var rfqItems = rawRfqItems.Select((item, idx) =>
        {
            itemBidsDict.TryGetValue(item.Id, out var bid);
            var quotedUnit = bid != null && bid.UnitPrice > 0 ? (decimal?)bid.UnitPrice : null;
            var quotedTotal = quotedUnit.HasValue ? (decimal?)(quotedUnit.Value * item.Quantity) : null;
            var brand = bid?.Brand?.Trim();
            var model = bid?.Model?.Trim();
            var offeredSpecs = !string.IsNullOrWhiteSpace(brand)
                ? string.Join(" ", new[] { brand, model, bid?.Color?.Trim() }.Where(s => !string.IsNullOrWhiteSpace(s)))
                : null;

            return new RfqItemDataDto
            {
                ItemNo = idx + 1,
                ItemName = item.ItemNameSnapshot?.Trim() ?? string.Empty,
                Specifications = item.CPRItem?.PRItem?.Description?.Trim() ?? item.ItemNameSnapshot?.Trim() ?? string.Empty,
                Quantity = item.Quantity,
                Unit = item.CPRItem?.PRItem?.PPMPItem?.Unit?.Trim() ?? "lot",
                ApprovedUnitCost = item.UnitPriceSnapshot,
                ApprovedTotalCost = item.Quantity * item.UnitPriceSnapshot,
                QuotedUnitPrice = quotedUnit,
                QuotedTotalCost = quotedTotal,
                OfferedBrand = brand,
                OfferedModel = model,
                OfferedSpecifications = offeredSpecs
            };
        }).ToList();

        var supplier = new RfqSupplierDataDto
        {
            SupplierName = !string.IsNullOrWhiteSpace(request.CompanyName) ? request.CompanyName.Trim() : "[Supplier / Bidder Name]",
            TradeName = !string.IsNullOrWhiteSpace(request.CompanyName) ? request.CompanyName.Trim() : "[Business / Store Name]",
            Address = request.BusinessAddress?.Trim() ?? string.Empty,
            ContactPerson = request.ContactPerson?.Trim() ?? string.Empty,
            ContactNumber = request.ContactNumber?.Trim() ?? string.Empty,
            Email = request.EmailAddress?.Trim() ?? string.Empty,
            TINNumber = request.TinNumber?.Trim() ?? string.Empty,
            PhilGEPSNumber = string.Empty,
            QuotedItems = rfqItems
        };

        var deliveryPeriod = !string.IsNullOrWhiteSpace(request.DeliveryPeriod)
            ? request.DeliveryPeriod.Trim()
            : (!string.IsNullOrWhiteSpace(rfq.DeliveryPeriod) ? rfq.DeliveryPeriod.Trim() : "[Delivery Period]");

        var rfqData = new RfqDataDto
        {
            RFQId = rfq.Id,
            RFQNumber = rfq.RFQNumber,
            QuotationNo = rfq.RFQNumber,
            ProjectName = projectName,
            Date = dateFormatted,
            Deadline = deadlineFormatted,
            ModeOfProcurement = modeName,
            ApprovedBudgetForContract = rfqItems.Sum(i => i.ApprovedTotalCost),
            PRNumber = prNumber,
            BacResolutionNumber = string.Empty,
            ProcuringEntity = ctx.ProcuringEntity,
            ProcuringEntityAddress = ctx.ProcuringEntityAddress,
            SubmissionLocation = ctx.SubmissionLocation,
            DeliveryLocation = ctx.DeliveryLocation,
            ContactEmail = ctx.ContactEmail,
            ContactPhone = ctx.ContactPhone,
            BacChairpersonName = ctx.BacChairpersonName,
            BacChairpersonTitle = ctx.BacChairpersonTitle,
            BacSecName = ctx.BacSecName,
            DeliveryPeriod = deliveryPeriod,
            IsBlankTemplate = false,
            SignatoryName = !string.IsNullOrWhiteSpace(request.ContactPerson) ? request.ContactPerson.Trim() : null,
            DateSigned = DateTime.UtcNow.ToString("MMMM dd, yyyy"),
            Items = rfqItems,
            Suppliers = new List<RfqSupplierDataDto> { supplier }
        };

        var bytes = await rendererService.RenderAsync(rfqData, DocumentType.Rfq, ExportFormat.Pdf, cancellationToken);
        var safeCompanyName = string.Concat((request.CompanyName ?? "Supplier").Split(Path.GetInvalidFileNameChars()));
        var fileName = $"RFQ_{rfq.RFQNumber}_Quotation_{safeCompanyName}.pdf";
        Response.Headers["Content-Disposition"] = $"inline; filename=\"{fileName}\"";
        return File(bytes, "application/pdf", fileName);
    }

    /// <summary>
    /// Submit a public supplier application with required documents for a procurement project.
    /// </summary>
    [HttpPost("projects/{id:guid}/apply")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SubmitApplication(Guid id, [FromBody] SubmitPublicApplicationRequest request)
    {
        var command = new SubmitPublicApplicationCommand(
            id,
            request.CompanyName,
            request.ContactPerson,
            request.EmailAddress,
            request.ContactNumber,
            request.TinNumber,
            request.BusinessAddress,
            request.Documents.Select(d => new ApplicationDocumentUploadItem(d.ChecklistItemId, d.FileId)).ToList(),
            request.ProposedBidAmount,
            request.DeliveryPeriod,
            request.PaymentTerms,
            request.WarrantyTerms,
            request.ValidityPeriodDays,
            request.Remarks,
            request.BidSecurityType,
            request.BidSecurityAmount,
            request.BidSecurityNumber,
            request.BidSecurityValidityDays,
            request.ItemBids
        );

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Check application submission and review status.
    /// </summary>
    [HttpGet("applications/{id:guid}/status")]
    [ProducesResponseType(typeof(ApiResponse<PublicApplicationStatusDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetApplicationStatus(Guid id)
    {
        var result = await mediator.Send(new GetPublicApplicationStatusQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}
