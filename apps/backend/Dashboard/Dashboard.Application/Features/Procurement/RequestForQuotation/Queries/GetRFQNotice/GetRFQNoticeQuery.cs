using ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Queries.GetRFQNotice;

public record GetRFQNoticeQuery(Guid Id) : IRequest<ApiResponse<RFQNoticeDto>>;

public class GetRFQNoticeQueryHandler(
    IUnitOfWork unitOfWork,
    IConfiguration configuration,
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

        // 1. Resolve OfficeId from sourcing hierarchy
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

        // 2. Resolve Main Organization or Head Office
        string? mainOrgOrHeadOfficeName = null;
        string? mainOrgOrHeadOfficeAddress = null;

        if (officeId != Guid.Empty)
        {
            var currentOffice = await unitOfWork.OfficeRepository.GetByIdWithDetailsAsync(officeId, cancellationToken);
            if (currentOffice != null)
            {
                while (currentOffice.ParentId.HasValue && currentOffice.ParentId.Value != Guid.Empty)
                {
                    var parentOffice = await unitOfWork.OfficeRepository.GetByIdWithDetailsAsync(currentOffice.ParentId.Value, cancellationToken);
                    if (parentOffice == null) break;
                    currentOffice = parentOffice;
                }

                if (currentOffice.Organization != null && !string.IsNullOrWhiteSpace(currentOffice.Organization.Name))
                {
                    mainOrgOrHeadOfficeName = currentOffice.Organization.Name.Trim();
                }
                else if (!string.IsNullOrWhiteSpace(currentOffice.Name))
                {
                    mainOrgOrHeadOfficeName = currentOffice.Name.Trim();
                }

                if (!string.IsNullOrWhiteSpace(currentOffice.Address))
                {
                    mainOrgOrHeadOfficeAddress = currentOffice.Address.Trim();
                }
            }
        }

        if (string.IsNullOrWhiteSpace(mainOrgOrHeadOfficeName))
        {
            var topOrg = await unitOfWork.OrganizationRepository.FindAsync(o => o.ParentId == null && !o.IsDeleted, cancellationToken)
                ?? await unitOfWork.OrganizationRepository.FindAsync(o => !o.IsDeleted, cancellationToken);

            if (topOrg != null && !string.IsNullOrWhiteSpace(topOrg.Name))
            {
                mainOrgOrHeadOfficeName = topOrg.Name.Trim();
            }
        }

        if (string.IsNullOrWhiteSpace(mainOrgOrHeadOfficeName))
        {
            var rootOffice = await unitOfWork.OfficeRepository.FindAsync(o => o.ParentId == null && !o.IsDeleted, cancellationToken);
            if (rootOffice != null && !string.IsNullOrWhiteSpace(rootOffice.Name))
            {
                mainOrgOrHeadOfficeName = rootOffice.Name.Trim();
                if (!string.IsNullOrWhiteSpace(rootOffice.Address))
                {
                    mainOrgOrHeadOfficeAddress = rootOffice.Address.Trim();
                }
            }
        }

        if (string.IsNullOrWhiteSpace(mainOrgOrHeadOfficeName))
        {
            mainOrgOrHeadOfficeName = GetConfigValue(configuration, "Procurement:ProcuringEntityName")
                ?? GetConfigValue(configuration, "Procurement:OrganizationName")
                ?? GetConfigValue(configuration, "Procurement:HeadOfficeName");
        }

        if (string.IsNullOrWhiteSpace(mainOrgOrHeadOfficeName))
        {
            logger.LogWarning(
                "RFQ {RFQNumber} (ID: {RFQId}) could not resolve Head Office / Procuring Entity name from office hierarchy, database organizations, or configuration ('Procurement:ProcuringEntityName'). Falling back to placeholder '{Placeholder}'.",
                rfq.RFQNumber, rfq.Id, "[Head Office / Procuring Entity]");
        }

        var procuringEntity = !string.IsNullOrWhiteSpace(mainOrgOrHeadOfficeName)
            ? mainOrgOrHeadOfficeName.Trim()
            : "[Head Office / Procuring Entity]";

        var configProcuringEntityAddress = GetConfigValue(configuration, "Procurement:ProcuringEntityAddress");
        if (string.IsNullOrWhiteSpace(mainOrgOrHeadOfficeAddress) && configProcuringEntityAddress == null)
        {
            logger.LogWarning(
                "RFQ {RFQNumber} (ID: {RFQId}) could not resolve Procuring Entity address from office hierarchy or configuration ('Procurement:ProcuringEntityAddress').",
                rfq.RFQNumber, rfq.Id);
        }

        var procuringEntityAddress = !string.IsNullOrWhiteSpace(mainOrgOrHeadOfficeAddress)
            ? mainOrgOrHeadOfficeAddress.Trim()
            : (configProcuringEntityAddress ?? string.Empty);

        // 3. Resolve live BAC Members or placeholders
        var bacChairperson = await unitOfWork.BACMemberRepository.FindAsync(
            m => m.IsActive && !m.IsDeleted && (m.Role.Trim() == "Chairperson" || m.Role.Contains("Chair")),
            cancellationToken);

        var bacSecretariat = await unitOfWork.BACMemberRepository.FindAsync(
            m => m.IsActive && !m.IsDeleted && (m.Role.Contains("Sec") || m.Position.Contains("Sec")),
            cancellationToken);

        var configBacChairpersonName = GetConfigValue(configuration, "Procurement:BacChairpersonName");
        if (bacChairperson == null && configBacChairpersonName == null)
        {
            logger.LogWarning(
                "RFQ {RFQNumber} (ID: {RFQId}) could not find an active BAC Chairperson in database or configuration ('Procurement:BacChairpersonName'). Falling back to placeholder '{Placeholder}'.",
                rfq.RFQNumber, rfq.Id, "[BAC Chairperson / Secretariat Name]");
        }

        var bacChairpersonName = (!string.IsNullOrWhiteSpace(bacChairperson?.FullName) ? bacChairperson.FullName.Trim() : null)
            ?? configBacChairpersonName
            ?? "[BAC Chairperson / Secretariat Name]";

        var configBacChairpersonTitle = GetConfigValue(configuration, "Procurement:BacChairpersonTitle");
        if (string.IsNullOrWhiteSpace(bacChairperson?.Position) && configBacChairpersonTitle == null)
        {
            logger.LogWarning(
                "RFQ {RFQNumber} (ID: {RFQId}) could not resolve BAC Chairperson designation/title from database or configuration ('Procurement:BacChairpersonTitle'). Falling back to placeholder '{Placeholder}'.",
                rfq.RFQNumber, rfq.Id, "[BAC Chairperson / Secretariat Designation]");
        }

        var bacChairpersonTitle = (!string.IsNullOrWhiteSpace(bacChairperson?.Position) ? bacChairperson.Position.Trim() : null)
            ?? configBacChairpersonTitle
            ?? "[BAC Chairperson / Secretariat Designation]";

        var configBacSecName = GetConfigValue(configuration, "Procurement:BacSecName");
        if (bacSecretariat == null && configBacSecName == null)
        {
            logger.LogWarning(
                "RFQ {RFQNumber} (ID: {RFQId}) could not find an active BAC Secretariat in database or configuration ('Procurement:BacSecName'). Falling back to placeholder '{Placeholder}'.",
                rfq.RFQNumber, rfq.Id, "[BAC Secretariat]");
        }

        var bacSecName = (!string.IsNullOrWhiteSpace(bacSecretariat?.FullName) ? bacSecretariat.FullName.Trim() : null)
            ?? configBacSecName
            ?? "[BAC Secretariat]";

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

        var configSubmissionLocation = GetConfigValue(configuration, "Procurement:SubmissionLocation");
        if (configSubmissionLocation == null && string.IsNullOrWhiteSpace(procuringEntityAddress))
        {
            logger.LogWarning(
                "RFQ {RFQNumber} (ID: {RFQId}) missing configuration for 'Procurement:SubmissionLocation' and no entity address available. Falling back to placeholder '{Placeholder}'.",
                rfq.RFQNumber, rfq.Id, "[Submission Location]");
        }

        var submissionLocation = configSubmissionLocation
            ?? (!string.IsNullOrWhiteSpace(procuringEntityAddress) ? procuringEntityAddress : "[Submission Location]");

        var configDeliveryLocation = GetConfigValue(configuration, "Procurement:DeliveryLocation");
        if (configDeliveryLocation == null && string.IsNullOrWhiteSpace(procuringEntityAddress))
        {
            logger.LogWarning(
                "RFQ {RFQNumber} (ID: {RFQId}) missing configuration for 'Procurement:DeliveryLocation' and no entity address available. Falling back to placeholder '{Placeholder}'.",
                rfq.RFQNumber, rfq.Id, "[Delivery Location]");
        }

        var deliveryLocation = configDeliveryLocation
            ?? (!string.IsNullOrWhiteSpace(procuringEntityAddress) ? procuringEntityAddress : "[Delivery Location]");

        var configEmail = GetConfigValue(configuration, "Procurement:BacEmail");
        if (configEmail == null)
        {
            logger.LogWarning(
                "RFQ {RFQNumber} (ID: {RFQId}) missing configuration for 'Procurement:BacEmail'. Falling back to placeholder '{Placeholder}'.",
                rfq.RFQNumber, rfq.Id, "[BAC Email Address]");
        }

        var contactEmail = configEmail ?? "[BAC Email Address]";

        var configPhone = GetConfigValue(configuration, "Procurement:BacPhone");
        if (configPhone == null)
        {
            logger.LogWarning(
                "RFQ {RFQNumber} (ID: {RFQId}) missing configuration for 'Procurement:BacPhone'. Falling back to placeholder '{Placeholder}'.",
                rfq.RFQNumber, rfq.Id, "[BAC Contact Number]");
        }

        var contactPhone = configPhone ?? "[BAC Contact Number]";

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
            ProcuringEntity = procuringEntity,
            SubmissionLocation = submissionLocation,
            ContactEmail = contactEmail,
            ContactPhone = contactPhone,
            BacChairpersonName = bacChairpersonName,
            BacChairpersonTitle = bacChairpersonTitle,
            BacSecName = bacSecName,
            GeneralConditions = $"1. DELIVERY PERIOD: {deliveryPeriod}\n" +
                                $"2. DELIVERY LOCATION: {deliveryLocation}\n" +
                                "3. PAYMENT TERMS: One Time Payment\n" +
                                "4. PRICE VALIDITY SHALL BE FOR A PERIOD OF 30 CALENDAR DAYS\n" +
                                "5. BIDDERS MUST INDICATE THE BRAND AND/OR MODEL NUMBER FOR EQUIPMENT AND ITS ACCESSORIES OR PERIPHERALS AND FOR ALL OTHER ITEMS IF APPLICABLE.\n" +
                                $"6. THE {procuringEntity.ToUpper()} RESERVES THE RIGHT TO REJECT ANY OR ALL BIDS FOR ANY JUSTIFIABLE GROUND.\n" +
                                "7. REQUIREMENTS: PHILGEPS REGISTRATION.",
            Items = items
        };

        return ApiResponse<RFQNoticeDto>.Success(noticeDto);
    }

    private static string? GetConfigValue(IConfiguration config, string key)
    {
        var val = config[key]?.Trim();
        return string.IsNullOrWhiteSpace(val) ? null : val;
    }
}
