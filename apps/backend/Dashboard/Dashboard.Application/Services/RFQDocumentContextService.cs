using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ERPEZ.Application.Services;

/// <summary>
/// Resolves the shared procurement document context (procuring entity, BAC signatories,
/// contact details) used by both RFQ document generation and the RFQ notice endpoint.
/// All EF/infrastructure access is delegated through domain repository interfaces.
/// </summary>
public sealed class RFQDocumentContextService(
    IUnitOfWork unitOfWork,
    IConfiguration configuration,
    ILogger<RFQDocumentContextService> logger) : IRFQDocumentContextService
{
    public async Task<RFQDocumentContext> ResolveAsync(
        string rfqNumber,
        Guid rfqId,
        Guid startingOfficeId,
        CancellationToken cancellationToken = default)
    {
        // 1. Walk the office hierarchy up to the root to get the head office / procuring entity
        string? mainOrgOrHeadOfficeName = null;
        string? mainOrgOrHeadOfficeAddress = null;

        var currentOffice = await unitOfWork.OfficeRepository.GetByIdWithDetailsAsync(startingOfficeId, cancellationToken);
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

        // 2. Fallback: top-level Organization
        if (string.IsNullOrWhiteSpace(mainOrgOrHeadOfficeName))
        {
            var topOrg = await unitOfWork.OrganizationRepository.FindAsync(o => o.ParentId == null && !o.IsDeleted, cancellationToken)
                ?? await unitOfWork.OrganizationRepository.FindAsync(o => !o.IsDeleted, cancellationToken);

            if (topOrg != null && !string.IsNullOrWhiteSpace(topOrg.Name))
            {
                mainOrgOrHeadOfficeName = topOrg.Name.Trim();
            }
        }

        // 3. Fallback: root Office
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

        // 4. Fallback: configuration keys
        if (string.IsNullOrWhiteSpace(mainOrgOrHeadOfficeName))
        {
            mainOrgOrHeadOfficeName = GetConfigValue("Procurement:ProcuringEntityName")
                ?? GetConfigValue("Procurement:OrganizationName")
                ?? GetConfigValue("Procurement:HeadOfficeName");
        }

        if (string.IsNullOrWhiteSpace(mainOrgOrHeadOfficeName))
        {
            logger.LogWarning(
                "RFQ {RFQNumber} (ID: {RFQId}) could not resolve Head Office / Procuring Entity name from office hierarchy, database organizations, or configuration ('Procurement:ProcuringEntityName'). Falling back to placeholder '{Placeholder}'.",
                rfqNumber, rfqId, "[Head Office / Procuring Entity]");
        }

        var procuringEntity = !string.IsNullOrWhiteSpace(mainOrgOrHeadOfficeName)
            ? mainOrgOrHeadOfficeName.Trim()
            : "[Head Office / Procuring Entity]";

        var configProcuringEntityAddress = GetConfigValue("Procurement:ProcuringEntityAddress");
        if (string.IsNullOrWhiteSpace(mainOrgOrHeadOfficeAddress) && configProcuringEntityAddress == null)
        {
            logger.LogWarning(
                "RFQ {RFQNumber} (ID: {RFQId}) could not resolve Procuring Entity address from office hierarchy or configuration ('Procurement:ProcuringEntityAddress').",
                rfqNumber, rfqId);
        }

        var procuringEntityAddress = !string.IsNullOrWhiteSpace(mainOrgOrHeadOfficeAddress)
            ? mainOrgOrHeadOfficeAddress.Trim()
            : (configProcuringEntityAddress ?? string.Empty);

        // 5. Resolve BAC Chairperson — BACMember → PersonnelPosition → config → placeholder
        var bacChairperson = await unitOfWork.BACMemberRepository.FindAsync(
            m => m.IsActive && !m.IsDeleted && (m.Role.Trim() == "Chairperson" || m.Role.Contains("Chair")),
            cancellationToken);

        string? resolvedChairpersonName = !string.IsNullOrWhiteSpace(bacChairperson?.FullName) ? bacChairperson.FullName.Trim() : null;
        string? resolvedChairpersonTitle = !string.IsNullOrWhiteSpace(bacChairperson?.Position) ? bacChairperson.Position.Trim() : null;

        if (string.IsNullOrWhiteSpace(resolvedChairpersonName))
        {
            var chairPersonnel = await unitOfWork.PersonnelPositionRepository.GetActiveByPositionTitleAsync("BAC Chair", cancellationToken);
            if (chairPersonnel != null)
            {
                resolvedChairpersonName = chairPersonnel.User?.FullName?.Trim();
                resolvedChairpersonTitle = chairPersonnel.Position?.FunctionalTitle?.Trim() ?? chairPersonnel.Position?.Title?.Trim();
            }
        }

        // 6. Resolve BAC Secretariat — BACMember → PersonnelPosition → config → placeholder
        var bacSecretariat = await unitOfWork.BACMemberRepository.FindAsync(
            m => m.IsActive && !m.IsDeleted && (m.Role.Contains("Sec") || m.Position.Contains("Sec")),
            cancellationToken);

        string? resolvedSecName = !string.IsNullOrWhiteSpace(bacSecretariat?.FullName) ? bacSecretariat.FullName.Trim() : null;

        if (string.IsNullOrWhiteSpace(resolvedSecName))
        {
            var secPersonnel = await unitOfWork.PersonnelPositionRepository.GetActiveByPositionTitleAsync("BAC Sec", cancellationToken);
            if (secPersonnel != null)
            {
                resolvedSecName = secPersonnel.User?.FullName?.Trim();
            }
        }

        // Chairperson name
        var configBacChairpersonName = GetConfigValue("Procurement:BacChairpersonName");
        if (string.IsNullOrWhiteSpace(resolvedChairpersonName) && configBacChairpersonName == null)
        {
            logger.LogWarning(
                "RFQ {RFQNumber} (ID: {RFQId}) could not find an active BAC Chairperson in database or configuration ('Procurement:BacChairpersonName'). Falling back to placeholder '{Placeholder}'.",
                rfqNumber, rfqId, "[BAC Chairperson / Secretariat Name]");
        }

        var bacChairpersonName = resolvedChairpersonName ?? configBacChairpersonName ?? "[BAC Chairperson / Secretariat Name]";

        // Chairperson title
        var configBacChairpersonTitle = GetConfigValue("Procurement:BacChairpersonTitle");
        if (string.IsNullOrWhiteSpace(resolvedChairpersonTitle) && configBacChairpersonTitle == null)
        {
            logger.LogWarning(
                "RFQ {RFQNumber} (ID: {RFQId}) could not resolve BAC Chairperson designation/title from database or configuration ('Procurement:BacChairpersonTitle'). Falling back to placeholder '{Placeholder}'.",
                rfqNumber, rfqId, "[BAC Chairperson / Secretariat Designation]");
        }

        var bacChairpersonTitle = resolvedChairpersonTitle ?? configBacChairpersonTitle ?? "[BAC Chairperson / Secretariat Designation]";

        // Secretariat name
        var configBacSecName = GetConfigValue("Procurement:BacSecName");
        if (string.IsNullOrWhiteSpace(resolvedSecName) && configBacSecName == null)
        {
            logger.LogWarning(
                "RFQ {RFQNumber} (ID: {RFQId}) could not find an active BAC Secretariat in database or configuration ('Procurement:BacSecName'). Falling back to placeholder '{Placeholder}'.",
                rfqNumber, rfqId, "[BAC Secretariat]");
        }

        var bacSecName = resolvedSecName ?? configBacSecName ?? "[BAC Secretariat]";

        // 7. Resolve optional config-driven fields
        var configSubmissionLocation = GetConfigValue("Procurement:SubmissionLocation");
        if (configSubmissionLocation == null && string.IsNullOrWhiteSpace(procuringEntityAddress))
        {
            logger.LogWarning(
                "RFQ {RFQNumber} (ID: {RFQId}) missing configuration for 'Procurement:SubmissionLocation' and no entity address available. Falling back to placeholder '{Placeholder}'.",
                rfqNumber, rfqId, "[Submission Location]");
        }

        var submissionLocation = configSubmissionLocation
            ?? (!string.IsNullOrWhiteSpace(procuringEntityAddress) ? procuringEntityAddress : "[Submission Location]");

        var configDeliveryLocation = GetConfigValue("Procurement:DeliveryLocation");
        if (configDeliveryLocation == null && string.IsNullOrWhiteSpace(procuringEntityAddress))
        {
            logger.LogWarning(
                "RFQ {RFQNumber} (ID: {RFQId}) missing configuration for 'Procurement:DeliveryLocation' and no entity address available. Falling back to placeholder '{Placeholder}'.",
                rfqNumber, rfqId, "[Delivery Location]");
        }

        var deliveryLocation = configDeliveryLocation
            ?? (!string.IsNullOrWhiteSpace(procuringEntityAddress) ? procuringEntityAddress : "[Delivery Location]");

        var configEmail = GetConfigValue("Procurement:BacEmail");
        if (configEmail == null)
        {
            logger.LogWarning(
                "RFQ {RFQNumber} (ID: {RFQId}) missing configuration for 'Procurement:BacEmail'. Falling back to placeholder '{Placeholder}'.",
                rfqNumber, rfqId, "[BAC Email Address]");
        }

        var contactEmail = configEmail ?? "[BAC Email Address]";

        var configPhone = GetConfigValue("Procurement:BacPhone");
        if (configPhone == null)
        {
            logger.LogWarning(
                "RFQ {RFQNumber} (ID: {RFQId}) missing configuration for 'Procurement:BacPhone'. Falling back to placeholder '{Placeholder}'.",
                rfqNumber, rfqId, "[BAC Contact Number]");
        }

        var contactPhone = configPhone ?? "[BAC Contact Number]";

        return new RFQDocumentContext
        {
            ProcuringEntity = procuringEntity,
            ProcuringEntityAddress = procuringEntityAddress,
            BacChairpersonName = bacChairpersonName,
            BacChairpersonTitle = bacChairpersonTitle,
            BacSecName = bacSecName,
            SubmissionLocation = submissionLocation,
            DeliveryLocation = deliveryLocation,
            ContactEmail = contactEmail,
            ContactPhone = contactPhone
        };
    }

    private string? GetConfigValue(string key)
    {
        var val = configuration[key]?.Trim();
        return string.IsNullOrWhiteSpace(val) ? null : val;
    }
}
