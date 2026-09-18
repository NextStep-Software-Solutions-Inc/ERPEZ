using ERPEZ.Application.Features.Procurement.SupplierPortal.Dtos;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetPublicProjectDetail;

public class GetPublicProjectDetailQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPublicProjectDetailQuery, ApiResponse<PublicProjectDetailDto>>
{
    private static readonly string[] allowedFallbackStatuses = ["Open", "ClosingSoon", "Published", "ROUTED_TO_PORTAL", "Active", "Posted"];

    public async Task<ApiResponse<PublicProjectDetailDto>> Handle(
        GetPublicProjectDetailQuery request, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository
            .GetWithPublicDetailsByIdAsync(request.Id, cancellationToken);

        if (project == null)
        {
            // Check if ID belongs to an RFQ
            var rfq = await unitOfWork.RFQRepository.Query()
                .Include(r => r.ModeOfProcurement)
                .Include(r => r.ConsolidatedPR)
                .Include(r => r.RFQItems)
                    .ThenInclude(i => i.CPRItem)
                        .ThenInclude(ci => ci.PRItem)
                .FirstOrDefaultAsync(r => r.Id == request.Id && !r.IsDeleted, cancellationToken);

            if (rfq == null)
            {
                throw new NotFoundException("Project not found.");
            }

            if (rfq.Status != StatusEnum.Approved)
            {
                throw new NotFoundException("This RFQ is not currently available on the public portal.");
            }

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var isClosed = rfq.Deadline.HasValue && rfq.Deadline.Value < today;
            var isClosingSoon = rfq.Deadline.HasValue && !isClosed && rfq.Deadline.Value <= today.AddDays(3);
            var status = isClosed ? "Closed" : (isClosingSoon ? "ClosingSoon" : "Open");

            var deadlineDt = rfq.Deadline.HasValue ? rfq.Deadline.Value.ToDateTime(new TimeOnly(12, 0)) : (DateTime?)null;
            var datePostedDt = rfq.Date != default ? rfq.Date.ToDateTime(TimeOnly.MinValue) : (rfq.UpdatedAt ?? rfq.CreatedAt);

            int? deliveryDays = null;
            if (!string.IsNullOrWhiteSpace(rfq.DeliveryPeriod))
            {
                var match = Regex.Match(rfq.DeliveryPeriod, @"\d+");
                if (match.Success && int.TryParse(match.Value, out var parsedDays))
                {
                    deliveryDays = parsedDays;
                }
            }

            var title = !string.IsNullOrWhiteSpace(rfq.Description)
                ? rfq.Description
                : (!string.IsNullOrWhiteSpace(rfq.Purpose) ? rfq.Purpose : rfq.RFQNumber);

            var requiredSubmissions = new List<RequiredSubmissionDto>
            {
                new()
                {
                    ChecklistItemId = Guid.Parse("00000000-0000-0000-0000-000000000001"),
                    DocumentName    = "Valid Mayor's / Business Permit",
                    Description     = "Issued by the city or municipality where the principal place of business is located",
                    IsRequired      = true,
                    OrderIndex      = 1,
                    EnvelopeType    = 1
                },
                new()
                {
                    ChecklistItemId = Guid.Parse("00000000-0000-0000-0000-000000000002"),
                    DocumentName    = "PhilGEPS Registration Number / Certificate",
                    Description     = "Proof of active PhilGEPS registration",
                    IsRequired      = true,
                    OrderIndex      = 2,
                    EnvelopeType    = 1
                }
            };

            if (rfq.TotalAmount > 50000m)
            {
                requiredSubmissions.Add(new RequiredSubmissionDto
                {
                    ChecklistItemId = Guid.Parse("00000000-0000-0000-0000-000000000003"),
                    DocumentName    = "Omnibus Sworn Statement (GPPB Prescribed Form)",
                    Description     = "Original notarized Omnibus Sworn Statement with Secretary's Certificate or SPA",
                    IsRequired      = true,
                    OrderIndex      = 3,
                    EnvelopeType    = 1,
                    DownloadUrl     = "/documents/templates/omnibus_sworn_statement.pdf"
                });
            }

            requiredSubmissions.Add(new RequiredSubmissionDto
            {
                ChecklistItemId = rfq.Id,
                DocumentName    = $"Price Quotation Form - {rfq.RFQNumber}",
                Description     = "Duly signed and completed official Request for Quotation proposal sheet",
                IsRequired      = true,
                OrderIndex      = 4,
                EnvelopeType    = 2,
                DownloadUrl     = $"/api/public/projects/{rfq.Id}/rfq-document"
            });

            var bidNotices = new List<BidNoticeDto>
            {
                new()
                {
                    ChecklistItemId = rfq.Id,
                    DocumentName    = $"Request for Quotation Notice - {rfq.RFQNumber}",
                    Description     = $"Official BAC Request for Quotation Document for {rfq.RFQNumber}",
                    DownloadUrl     = $"/api/public/projects/{rfq.Id}/rfq-document",
                    OrderIndex      = 1,
                    PostedOn        = datePostedDt
                }
            };

            if (rfq.TotalAmount > 50000m)
            {
                bidNotices.Add(new BidNoticeDto
                {
                    ChecklistItemId = Guid.Parse("00000000-0000-0000-0000-000000000003"),
                    DocumentName    = "Omnibus Sworn Statement Template",
                    Description     = "Standard GPPB Prescribed Omnibus Sworn Statement template",
                    DownloadUrl     = "/documents/templates/omnibus_sworn_statement.pdf",
                    OrderIndex      = 2,
                    PostedOn        = datePostedDt
                });
            }

            var rfqItems = rfq.RFQItems
                .Where(i => !i.IsDeleted)
                .Select(item => new PublicProjectItemDto
                {
                    Id = item.Id,
                    ItemName = !string.IsNullOrWhiteSpace(item.ItemNameSnapshot)
                        ? item.ItemNameSnapshot
                        : (item.CPRItem?.PRItem?.Name ?? "Item"),
                    Description = item.CPRItem?.PRItem?.Description
                        ?? item.CPRItem?.PRItem?.PPMPItem?.Description,
                    Quantity = item.Quantity,
                    Uom = item.CPRItem?.PRItem?.PPMPItem?.Unit ?? "Unit",
                    ABCUnitPrice = item.UnitPriceSnapshot,
                    ABCTotalPrice = item.Quantity * item.UnitPriceSnapshot
                }).ToList();

            var rfqDto = new PublicProjectDetailDto
            {
                Id                     = rfq.Id,
                Title                  = title,
                ContractNo             = rfq.RFQNumber,
                ABC                    = rfq.TotalAmount,
                ModeOfProcurement      = rfq.ModeOfProcurement?.Name ?? "Small Value Procurement (SVP)",
                Status                 = status,
                ScopeOfWork            = rfq.Purpose ?? rfq.Description,
                NonRefundableBidderFee = null,
                DeliveryPeriodDays     = deliveryDays,
                DeliveryPeriod         = rfq.DeliveryPeriod,
                SubmissionDeadline     = deadlineDt,
                BidOpeningDate         = deadlineDt,
                PreBidConferenceDate   = null,
                DatePosted             = datePostedDt,
                RequiredSubmissions    = requiredSubmissions,
                BidNotices             = bidNotices,
                Items                  = rfqItems
            };

            return ApiResponse<PublicProjectDetailDto>.Success(rfqDto);
        }

        // Visibility gate: prefer BiddingDocument.Status once TC-02 has created one
        // for this project. Fall back to ProcurementProject.Status until the PBD
        // posting flow is live — avoids hard-gating every project to 404 before
        // TC-02 ships. Remove the fallback branch once TC-02 is fully rolled out.
        var isPubliclyVisible = project.BiddingDocument is not null
            ? project.BiddingDocument.Status == "Posted"
            : allowedFallbackStatuses.Contains(project.Status);

        if (!isPubliclyVisible)
            throw new NotFoundException("This project is not currently available on the public portal.");

        DateTime? GetDate(ProcurementActivitySystemRole role) =>
            project.BiddingActivitySchedules
                .FirstOrDefault(s => s.ProcurementActivityType?.SystemRole == role)
                ?.StartDate;

        DateTime? GetDeadline(ProcurementActivitySystemRole role)
        {
            var schedule = project.BiddingActivitySchedules
                .FirstOrDefault(s => s.ProcurementActivityType?.SystemRole == role);
            if (schedule == null) return null;
            return schedule.EndDate != default ? schedule.EndDate : schedule.StartDate;
        }

        var projectSubmissions = project.ProjectDocumentChecklists
            .Where(c => c.IsRequired)
            .OrderBy(c => c.OrderIndex)
            .Select(c => new RequiredSubmissionDto
            {
                ChecklistItemId = c.Id,
                DocumentName    = c.MasterDocumentType?.Name ?? c.CustomDocumentName ?? string.Empty,
                Description     = c.MasterDocumentType?.Description,
                IsRequired      = c.IsRequired,
                OrderIndex      = c.OrderIndex,
                EnvelopeType    = c.EnvelopeType != 0 ? c.EnvelopeType : (c.MasterDocumentType?.EnvelopeType ?? 1),
                DownloadUrl     = (c.CustomTemplateFileUrl != null || c.MasterDocumentType?.TemplateFileUrl != null)
                                    ? $"/api/public/projects/{project.Id}/bid-notices/{c.Id}/download"
                                    : null
            }).ToList();

        var projectBidNotices = project.ProjectDocumentChecklists
            .Where(c => c.IsRequired && (c.CustomTemplateFileUrl != null || c.MasterDocumentType?.TemplateFileUrl != null))
            .OrderBy(c => c.OrderIndex)
            .Select(c => new BidNoticeDto
            {
                ChecklistItemId = c.Id,
                DocumentName    = c.MasterDocumentType?.Name ?? c.CustomDocumentName ?? string.Empty,
                Description     = c.MasterDocumentType?.Description,
                DownloadUrl     = $"/api/public/projects/{project.Id}/bid-notices/{c.Id}/download",
                OrderIndex      = c.OrderIndex,
                PostedOn        = c.CreatedAt
            }).ToList();

        // ── 4. RESOLVE PROJECT ITEMS (From Associated RFQ or Consolidated PR) ──
        List<PublicProjectItemDto> projectItems = [];

        var associatedRfq = await unitOfWork.RFQRepository.Query()
            .Include(r => r.RFQItems)
                .ThenInclude(i => i.CPRItem)
                    .ThenInclude(ci => ci.PRItem)
                        .ThenInclude(p => p.PPMPItem)
            .FirstOrDefaultAsync(r =>
                (project.ConsolidatedPRId.HasValue && r.ConsolidatedPRId == project.ConsolidatedPRId.Value)
                || (project.ContractNo != null && r.RFQNumber.Contains(project.ContractNo))
                || (project.ContractNo != null && r.TracingNumber.Contains(project.ContractNo)),
                cancellationToken);

        if (associatedRfq != null && associatedRfq.RFQItems.Any())
        {
            projectItems = associatedRfq.RFQItems
                .Where(i => !i.IsDeleted)
                .Select(item => new PublicProjectItemDto
                {
                    Id = item.Id,
                    ItemName = !string.IsNullOrWhiteSpace(item.ItemNameSnapshot)
                        ? item.ItemNameSnapshot
                        : (item.CPRItem?.PRItem?.Name ?? "Item"),
                    Description = item.CPRItem?.PRItem?.Description
                        ?? item.CPRItem?.PRItem?.PPMPItem?.Description,
                    Quantity = item.Quantity,
                    Uom = item.CPRItem?.PRItem?.PPMPItem?.Unit ?? (item.Quantity > 1 ? "Units" : "Unit"),
                    ABCUnitPrice = item.UnitPriceSnapshot,
                    ABCTotalPrice = item.Quantity * item.UnitPriceSnapshot
                }).ToList();
        }
        else if (project.ConsolidatedPRId.HasValue)
        {
            var cpr = await unitOfWork.ConsolidatedPRRepository.Query()
                .Include(c => c.ConsolidatedPRItems)
                    .ThenInclude(ci => ci.PRItem)
                        .ThenInclude(pi => pi.PPMPItem)
                .FirstOrDefaultAsync(c => c.Id == project.ConsolidatedPRId.Value, cancellationToken);

            if (cpr?.ConsolidatedPRItems != null && cpr.ConsolidatedPRItems.Any())
            {
                projectItems = cpr.ConsolidatedPRItems
                    .Where(ci => !ci.IsDeleted && ci.PRItem != null)
                    .Select(ci => new PublicProjectItemDto
                    {
                        Id = ci.Id,
                        ItemName = ci.PRItem.Name,
                        Description = ci.PRItem.Description ?? ci.PRItem.PPMPItem?.Description,
                        Quantity = ci.PRItem.RequestedQuantity,
                        Uom = ci.PRItem.PPMPItem?.Unit ?? "Unit",
                        ABCUnitPrice = ci.PRItem.UnitCost,
                        ABCTotalPrice = ci.PRItem.Amount > 0 ? ci.PRItem.Amount : ci.PRItem.RequestedQuantity * ci.PRItem.UnitCost
                    }).ToList();
            }
        }

        var deadline = GetDeadline(ProcurementActivitySystemRole.SubmissionOpeningOfBids);
        var nowUtc = DateTime.UtcNow;
        var isProjectClosed = string.Equals(project.Status, "Closed", StringComparison.OrdinalIgnoreCase)
            || (deadline.HasValue && deadline.Value < nowUtc);

        var isProjectClosingSoon = !isProjectClosed && (
            string.Equals(project.Status, "ClosingSoon", StringComparison.OrdinalIgnoreCase)
            || (deadline.HasValue && deadline.Value <= nowUtc.AddDays(3)));

        var effectiveStatus = isProjectClosed ? "Closed" : (isProjectClosingSoon ? "ClosingSoon" : "Open");

        var dto = new PublicProjectDetailDto
        {
            Id                     = project.Id,
            Title                  = project.Title,
            ContractNo             = project.ContractNo ?? (project.ConsolidatedPR != null ? project.ConsolidatedPR.CPRNumber : string.Empty),
            ABC                    = project.ABC,
            ModeOfProcurement      = project.ProcurementMode?.Name ?? string.Empty,
            Status                 = effectiveStatus,
            ScopeOfWork            = project.ScopeOfWork,
            NonRefundableBidderFee = project.NonRefundableBidderFee,
            DeliveryPeriodDays     = project.DeliveryPeriodDays,
            DeliveryPeriod         = project.DeliveryPeriodDays.HasValue ? $"{project.DeliveryPeriodDays} Day/s" : null,
            SubmissionDeadline     = deadline,
            BidOpeningDate         = GetDate(ProcurementActivitySystemRole.SubmissionOpeningOfBids),
            PreBidConferenceDate   = GetDate(ProcurementActivitySystemRole.PreBidConference),
            DatePosted             = GetDate(ProcurementActivitySystemRole.AdvertisementPosting) ?? project.UpdatedAt ?? project.CreatedAt,
            RequiredSubmissions    = projectSubmissions,
            BidNotices             = projectBidNotices,
            Items                  = projectItems
        };

        return ApiResponse<PublicProjectDetailDto>.Success(dto);
    }
}