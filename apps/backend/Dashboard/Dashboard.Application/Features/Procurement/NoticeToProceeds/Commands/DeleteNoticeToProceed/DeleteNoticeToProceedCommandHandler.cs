using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.DeleteNoticeToProceed;

public class DeleteNoticeToProceedCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
    : IRequestHandler<DeleteNoticeToProceedCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(DeleteNoticeToProceedCommand request, CancellationToken cancellationToken)
    {
        var ntp = await unitOfWork.NoticeToProceedRepository.GetByIdAsync(request.Id, cancellationToken);
        if (ntp == null || ntp.IsDeleted)
        {
            return ApiResponse<bool>.Fail("Notice to Proceed not found.");
        }

        if (ntp.Status != NoticeToProceedStatus.Draft)
        {
            return ApiResponse<bool>.Fail($"Only Notice to Proceed in 'Draft' status can be deleted. Current status is '{ntp.Status}'.");
        }

        var actorName = currentUserService.Name ?? currentUserService.Username ?? "System";

        ntp.IsDeleted = true;
        ntp.DeletedAt = DateTime.UtcNow;
        ntp.DeletedBy = actorName;
        ntp.UpdatedAt = DateTime.UtcNow;
        ntp.UpdatedBy = actorName;

        unitOfWork.NoticeToProceedRepository.Update(ntp);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "Notice to Proceed draft deleted successfully.");
    }
}
