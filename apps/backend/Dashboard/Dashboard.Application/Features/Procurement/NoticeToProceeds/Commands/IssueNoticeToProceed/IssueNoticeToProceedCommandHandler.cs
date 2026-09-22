using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.IssueNoticeToProceed;

public class IssueNoticeToProceedCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService,
    ILogger<IssueNoticeToProceedCommandHandler>? logger = null)
    : IRequestHandler<IssueNoticeToProceedCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(IssueNoticeToProceedCommand request, CancellationToken cancellationToken)
    {
        var ntp = await unitOfWork.NoticeToProceedRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (ntp == null || ntp.IsDeleted)
        {
            return ApiResponse<bool>.Fail("Notice to Proceed not found.");
        }

        if (ntp.Status != NoticeToProceedStatus.Draft)
        {
            return ApiResponse<bool>.Fail($"Notice to Proceed in status '{ntp.Status}' cannot be issued. Only 'Draft' can be issued.");
        }

        var contract = ntp.Contract;
        if (contract == null || contract.IsDeleted || contract.Status == ContractStatus.Cancelled)
        {
            return ApiResponse<bool>.Fail("Linked contract is invalid or cancelled.");
        }

        var noa = contract.NoticeOfAward;
        var supplier = noa?.Supplier;
        var project = noa?.ProcurementProject;

        var actorId = Guid.TryParse(currentUserService.UserId, out var parsedId) ? parsedId : (Guid?)null;
        var actorName = currentUserService.Name ?? currentUserService.Username ?? "Head of the Procuring Entity";
        var now = DateTime.UtcNow;

        // Freeze historical snapshots authoritatively upon official issuance (RA 12009 historical audit requirement)
        ntp.ContractNumberSnapshot = contract.ContractNumber;
        ntp.ContractApprovedDateSnapshot = contract.ContractApprovedAt ?? (contract.ApprovedAt.HasValue ? DateOnly.FromDateTime(contract.ApprovedAt.Value) : null);
        ntp.AwardedAmountSnapshot = noa?.AwardedAmount ?? 0m;
        ntp.SupplierNameSnapshot = supplier?.Name ?? string.Empty;
        ntp.SupplierAddressSnapshot = supplier?.Address ?? string.Empty;
        ntp.ProjectTitleSnapshot = project?.Title ?? noa?.Description ?? contract.Description;

        // Set status and issuance metadata
        ntp.Status = NoticeToProceedStatus.Issued;
        ntp.IssuedById = actorId;
        ntp.IssuedByName = actorName;
        ntp.IssuedAt = now;

        if (request.EffectivityDate.HasValue)
        {
            ntp.EffectivityDate = request.EffectivityDate.Value;
        }
        else if (!ntp.EffectivityDate.HasValue)
        {
            ntp.EffectivityDate = ntp.NTPDate;
        }

        if (request.CommencementDate.HasValue)
        {
            ntp.CommencementDate = request.CommencementDate.Value;
        }
        else if (!ntp.CommencementDate.HasValue)
        {
            ntp.CommencementDate = ntp.EffectivityDate ?? ntp.NTPDate;
        }

        if (ntp.CommencementDate.HasValue && ntp.ImplementationPeriodDays.HasValue && !ntp.DeliveryCompletionDeadline.HasValue)
        {
            ntp.DeliveryCompletionDeadline = ntp.CommencementDate.Value.AddDays(ntp.ImplementationPeriodDays.Value);
        }

        ntp.UpdatedAt = now;
        ntp.UpdatedBy = actorName;

        unitOfWork.NoticeToProceedRepository.Update(ntp);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        // Check RA 12009 Section 66 Statutory 3-calendar-day issuance timeline
        var contractApprovedDate = contract.ContractApprovedAt
            ?? (contract.ApprovedAt.HasValue ? DateOnly.FromDateTime(contract.ApprovedAt.Value) : null);

        if (contractApprovedDate.HasValue)
        {
            var issuedDate = DateOnly.FromDateTime(now);
            var daysElapsed = issuedDate.DayNumber - contractApprovedDate.Value.DayNumber;
            if (daysElapsed > 3)
            {
                logger?.LogWarning(
                    "Procurement Compliance Warning: NTP {NtpNumber} ({NtpId}) was issued {DaysElapsed} calendar days after Contract approval date ({ApprovedDate}). This exceeds the 3-calendar-day statutory deadline prescribed under RA 12009 Section 66.",
                    ntp.NTPNumber, ntp.Id, daysElapsed, contractApprovedDate.Value);
            }
        }

        logger?.LogInformation(
            "Notice to Proceed {NtpNumber} ({NtpId}) officially issued by {ActorName}. Audit snapshots frozen: Contract={ContractNumber}, Supplier={SupplierName}, AwardedAmount={AwardedAmount:C}.",
            ntp.NTPNumber, ntp.Id, actorName, ntp.ContractNumberSnapshot, ntp.SupplierNameSnapshot, ntp.AwardedAmountSnapshot);

        return ApiResponse<bool>.Success(true, "Notice to Proceed issued successfully.");
    }
}
