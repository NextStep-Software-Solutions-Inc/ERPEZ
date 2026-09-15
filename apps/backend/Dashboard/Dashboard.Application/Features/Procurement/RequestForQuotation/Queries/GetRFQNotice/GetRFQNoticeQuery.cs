using ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.Extensions.Configuration;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Queries.GetRFQNotice;

public record GetRFQNoticeQuery(Guid Id) : IRequest<ApiResponse<RFQNoticeDto>>;

public class GetRFQNoticeQueryHandler(IUnitOfWork unitOfWork, IConfiguration configuration)
    : IRequestHandler<GetRFQNoticeQuery, ApiResponse<RFQNoticeDto>>
{
    public async Task<ApiResponse<RFQNoticeDto>> Handle(GetRFQNoticeQuery request, CancellationToken cancellationToken)
    {
        var rfq = await unitOfWork.RFQRepository.GetRFQWithDetailsAsync(request.Id, cancellationToken);
        if (rfq is null)
        {
            return ApiResponse<RFQNoticeDto>.Fail("RFQ not found.");
        }

        var projectName = !string.IsNullOrWhiteSpace(rfq.Description)
            ? rfq.Description
            : (!string.IsNullOrWhiteSpace(rfq.Purpose) ? rfq.Purpose : "Procurement Project");

        var modeName = rfq.ModeOfProcurement?.Name
            ?? "Negotiated Procurement - Small Value Procurement - Section 53.9, Rule XVI, Revised IRR of RA 9184";

        var datePosted = rfq.Date != default
            ? rfq.Date.ToString("MMMM dd, yyyy")
            : DateTime.UtcNow.ToString("MMMM dd, yyyy");

        var deadline = rfq.Deadline.HasValue
            ? rfq.Deadline.Value.ToString("dddd, MMMM dd, yyyy 'at 12:00 noon'")
            : "To be announced";

        var procuringEntity = configuration["Procurement:ProcuringEntityName"]
            ?? "University of Science and Technology of Southern Philippines";

        var submissionLocation = configuration["Procurement:SubmissionLocation"]
            ?? "Procurement Unit, 2nd Floor, USTP Gymnasium building";

        var contactEmail = configuration["Procurement:BacEmail"] ?? "bacsec@ustp.edu.ph";
        var contactPhone = configuration["Procurement:BacPhone"] ?? "856-1738 Local 1164";
        var bacChairpersonName = configuration["Procurement:BacChairpersonName"] ?? "ENGR. ALEX L. MAUREAL";
        var bacChairpersonTitle = configuration["Procurement:BacChairpersonTitle"] ?? "BAC IV CHAIRPERSON";

        var items = (rfq.RFQItems ?? [])
            .Where(i => !i.IsDeleted)
            .Select((item, idx) => new RFQNoticeItemDto
            {
                ItemNo = idx + 1,
                ItemName = item.ItemNameSnapshot,
                Description = item.CPRItem?.PRItem?.Description ?? item.ItemNameSnapshot,
                Quantity = item.Quantity,
                Unit = item.CPRItem?.PRItem?.PPMPItem?.Unit ?? "unit",
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
            ProcuringEntity = procuringEntity,
            SubmissionLocation = submissionLocation,
            ContactEmail = contactEmail,
            ContactPhone = contactPhone,
            BacChairpersonName = bacChairpersonName,
            BacChairpersonTitle = bacChairpersonTitle,
            GeneralConditions = "1. DELIVERY PERIOD OF 15 CALENDAR DAY UPON RECEIPT OF Purchase Order.\n" +
                                "2. DELIVERY LOCATION: SUPPLY OFFICE, USTP-CDO, C. M. RECTO AVENUE, LAPASAN CAGAYAN DE ORO CITY, MISAMIS ORIENTAL\n" +
                                "3. PAYMENT TERMS: One Time Payment\n" +
                                "4. PRICE VALIDITY SHALL BE FOR A PERIOD OF 30 CALENDAR DAYS\n" +
                                "5. BIDDERS MUST INDICATE THE BRAND AND/OR MODEL NUMBER FOR EQUIPMENT AND ITS ACCESSORIES OR PERIPHERALS AND FOR ALL OTHER ITEMS IF APPLICABLE.\n" +
                                "6. THE USTP RESERVES THE RIGHT TO REJECT ANY OR ALL BIDS FOR ANY JUSTIFIABLE GROUND.\n" +
                                "7. REQUIREMENTS: PHILGEPS REGISTRATION.",
            Items = items
        };

        return ApiResponse<RFQNoticeDto>.Success(noticeDto);
    }
}
