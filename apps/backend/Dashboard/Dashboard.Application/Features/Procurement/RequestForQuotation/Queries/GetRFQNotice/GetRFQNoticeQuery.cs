using ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Queries.GetRFQNotice;

public record GetRFQNoticeQuery(Guid Id) : IRequest<ApiResponse<RFQNoticeDto>>;

public class GetRFQNoticeQueryHandler(
    IUnitOfWork unitOfWork,
    IRFQDocumentContextService rfqContextService,
    ILogger<GetRFQNoticeQueryHandler> logger)
    : IRequestHandler<GetRFQNoticeQuery, ApiResponse<RFQNoticeDto>>
{
    public async Task<ApiResponse<RFQNoticeDto>> Handle(GetRFQNoticeQuery request, CancellationToken cancellationToken)
    {
        var rfq = await unitOfWork.RFQRepository.GetRFQWithDetailsAsync(request.Id, cancellationToken);
        if (rfq is null)
        {
            return ApiResponse<RFQNoticeDto>.Fail("RFQ not found.");
        }

        // 1. Resolve OfficeId from sourcing hierarchy (RFQ-specific — not shared with other document types)
        Guid officeId = Guid.Empty;

        var prOfficeId = rfq.RFQItems?
            .Select(i => i.CPRItem?.PurchaseRequest?.OfficeId ?? i.CPRItem?.PRItem?.PurchaseRequest?.OfficeId)
            .FirstOrDefault(id => id.HasValue && id.Value != Guid.Empty);

        if (prOfficeId.HasValue)
        {
            officeId = prOfficeId.Value;
        }
        else
        {
            var cprOfficeId = rfq.ConsolidatedPR?.ConsolidatedPRItems?
                .Select(ci => ci.PurchaseRequest?.OfficeId)
                .FirstOrDefault(id => id.HasValue && id.Value != Guid.Empty);

            if (cprOfficeId.HasValue)
            {
                officeId = cprOfficeId.Value;
            }
        }

        if (officeId == Guid.Empty)
        {
            var defaultOffice = await unitOfWork.OfficeRepository.FindAsync(o => !o.IsDeleted, cancellationToken)
                ?? await unitOfWork.OfficeRepository.FindAsync(o => true, cancellationToken);
            if (defaultOffice != null)
            {
                officeId = defaultOffice.Id;
                logger.LogWarning(
                    "RFQ {RFQNumber} (ID: {RFQId}) items do not specify an originating Purchase Request office; falling back to active database office {OfficeId}.",
                    rfq.RFQNumber, rfq.Id, officeId);
            }
        }

        // 2. Delegate shared context resolution (procuring entity, BAC signatories, contact details)
        //    to the dedicated service — keeping this handler DRY with GenerateRFQDocumentCommandHandler.
        var ctx = officeId != Guid.Empty
            ? await rfqContextService.ResolveAsync(rfq.RFQNumber, rfq.Id, officeId, cancellationToken)
            : await rfqContextService.ResolveAsync(rfq.RFQNumber, rfq.Id, Guid.Empty, cancellationToken);

        // 3. Resolve RFQ-specific fields
        var projectName = !string.IsNullOrWhiteSpace(rfq.Description)
            ? rfq.Description.Trim()
            : (!string.IsNullOrWhiteSpace(rfq.Purpose) ? rfq.Purpose.Trim() : "[Project Name / Purpose]");

        var modeName = !string.IsNullOrWhiteSpace(rfq.ModeOfProcurement?.Name)
            ? rfq.ModeOfProcurement.Name.Trim()
            : "[Mode of Procurement]";

        var datePosted = rfq.Date != default
            ? rfq.Date.ToString("MMMM dd, yyyy")
            : DateTime.UtcNow.ToString("MMMM dd, yyyy");

        var deadline = rfq.Deadline.HasValue
            ? rfq.Deadline.Value.ToString("dddd, MMMM dd, yyyy 'at 12:00 noon'")
            : "[Deadline Date]";

        var deliveryPeriod = !string.IsNullOrWhiteSpace(rfq.DeliveryPeriod)
            ? rfq.DeliveryPeriod.Trim()
            : "[Delivery Period]";

        var items = (rfq.RFQItems ?? [])
            .Where(i => !i.IsDeleted)
            .Select((item, idx) => new RFQNoticeItemDto
            {
                ItemNo = idx + 1,
                ItemName = item.ItemNameSnapshot?.Trim() ?? string.Empty,
                Description = item.CPRItem?.PRItem?.Description?.Trim() ?? item.ItemNameSnapshot?.Trim() ?? string.Empty,
                Quantity = item.Quantity,
                Unit = item.CPRItem?.PRItem?.PPMPItem?.Unit?.Trim() ?? "unit",
                ApprovedUnitCost = item.UnitPriceSnapshot,
                TotalCost = item.Quantity * item.UnitPriceSnapshot
            })
            .ToList();

        var totalABC = items.Sum(i => i.TotalCost);
        if (totalABC <= 0 && rfq.TotalAmount > 0)
        {
            totalABC = rfq.TotalAmount;
        }

        var noticeDto = new RFQNoticeDto
        {
            RFQId = rfq.Id,
            ReferenceNo = rfq.RFQNumber,
            ProjectName = projectName,
            ModeOfProcurement = modeName,
            ApprovedBudgetForContract = totalABC,
            DatePosted = datePosted,
            SubmissionDeadline = deadline,
            ProcuringEntity = ctx.ProcuringEntity,
            SubmissionLocation = ctx.SubmissionLocation,
            ContactEmail = ctx.ContactEmail,
            ContactPhone = ctx.ContactPhone,
            BacChairpersonName = ctx.BacChairpersonName,
            BacChairpersonTitle = ctx.BacChairpersonTitle,
            BacSecName = ctx.BacSecName,
            GeneralConditions = $"1. DELIVERY PERIOD: {deliveryPeriod}\n" +
                                $"2. DELIVERY LOCATION: {ctx.DeliveryLocation}\n" +
                                "3. PAYMENT TERMS: One Time Payment\n" +
                                "4. PRICE VALIDITY SHALL BE FOR A PERIOD OF 30 CALENDAR DAYS\n" +
                                "5. BIDDERS MUST INDICATE THE BRAND AND/OR MODEL NUMBER FOR EQUIPMENT AND ITS ACCESSORIES OR PERIPHERALS AND FOR ALL OTHER ITEMS IF APPLICABLE.\n" +
                                $"6. THE {ctx.ProcuringEntity.ToUpper()} RESERVES THE RIGHT TO REJECT ANY OR ALL BIDS FOR ANY JUSTIFIABLE GROUND.\n" +
                                "7. REQUIREMENTS: PHILGEPS REGISTRATION.",
            Items = items
        };

        return ApiResponse<RFQNoticeDto>.Success(noticeDto);
    }
}
