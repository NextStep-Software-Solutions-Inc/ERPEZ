using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.RecordNoticeToProceedReceipt;

public class RecordNoticeToProceedReceiptCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
    : IRequestHandler<RecordNoticeToProceedReceiptCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(RecordNoticeToProceedReceiptCommand request, CancellationToken cancellationToken)
    {
        var ntp = await unitOfWork.NoticeToProceedRepository.GetByIdAsync(request.Id, cancellationToken);
        if (ntp == null || ntp.IsDeleted)
        {
            return ApiResponse<bool>.Fail("Notice to Proceed not found.");
        }

        if (ntp.Status != NoticeToProceedStatus.Issued)
        {
            return ApiResponse<bool>.Fail($"Receipt can only be recorded for Issued Notice to Proceed. Current status is '{ntp.Status}'.");
        }

        var effectiveReceivedAt = request.EffectiveReceivedAt;
        var effectiveReceivedByName = request.EffectiveReceivedByName;

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        if (effectiveReceivedAt > today)
        {
            return ApiResponse<bool>.Fail("Receipt date cannot be in the future.");
        }

        if (effectiveReceivedAt < ntp.NTPDate)
        {
            return ApiResponse<bool>.Fail($"Receipt date ({effectiveReceivedAt:yyyy-MM-dd}) cannot be earlier than the Notice to Proceed date ({ntp.NTPDate:yyyy-MM-dd}).");
        }

        var actorName = currentUserService.Name ?? currentUserService.Username ?? "System";
        var now = DateTime.UtcNow;

        ntp.ReceivedAt = effectiveReceivedAt;
        ntp.ReceivedByName = effectiveReceivedByName;

        if (request.SignedDocumentFileId.HasValue)
        {
            ntp.SignedDocumentFileId = request.SignedDocumentFileId;
            ntp.SignedDocumentFileName = request.SignedDocumentFileName;
        }

        ntp.Status = NoticeToProceedStatus.Received;

        // If effectivity date was not set, effectivity is upon receipt (RA 12009 Sec. 66)
        if (!ntp.EffectivityDate.HasValue)
        {
            ntp.EffectivityDate = effectiveReceivedAt;
        }

        if (!ntp.CommencementDate.HasValue)
        {
            ntp.CommencementDate = effectiveReceivedAt;
        }

        if (ntp.CommencementDate.HasValue && ntp.ImplementationPeriodDays.HasValue && !ntp.DeliveryCompletionDeadline.HasValue)
        {
            ntp.DeliveryCompletionDeadline = ntp.CommencementDate.Value.AddDays(ntp.ImplementationPeriodDays.Value);
        }

        ntp.UpdatedAt = now;
        ntp.UpdatedBy = actorName;

        unitOfWork.NoticeToProceedRepository.Update(ntp);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "Notice to Proceed receipt (conforme) recorded successfully.");
    }
}
