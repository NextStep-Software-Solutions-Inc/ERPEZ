using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.CancelNoticeToProceed;

public class CancelNoticeToProceedCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
    : IRequestHandler<CancelNoticeToProceedCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(CancelNoticeToProceedCommand request, CancellationToken cancellationToken)
    {
        var ntp = await unitOfWork.NoticeToProceedRepository.GetByIdAsync(request.Id, cancellationToken);
        if (ntp == null || ntp.IsDeleted)
        {
            return ApiResponse<bool>.Fail("Notice to Proceed not found.");
        }

        if (ntp.Status == NoticeToProceedStatus.Cancelled)
        {
            return ApiResponse<bool>.Fail("Notice to Proceed is already cancelled.");
        }

        var actorId = Guid.TryParse(currentUserService.UserId, out var parsedId) ? parsedId : (Guid?)null;
        var actorName = currentUserService.Name ?? currentUserService.Username ?? "System";
        var now = DateTime.UtcNow;

        ntp.Status = NoticeToProceedStatus.Cancelled;
        ntp.CancellationReason = request.Reason.Trim();
        ntp.CancelledById = actorId;
        ntp.CancelledAt = now;
        ntp.UpdatedAt = now;
        ntp.UpdatedBy = actorName;

        unitOfWork.NoticeToProceedRepository.Update(ntp);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "Notice to Proceed cancelled successfully.");
    }
}
