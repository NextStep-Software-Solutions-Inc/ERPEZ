using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.UpdateNoticeToProceed;

public class UpdateNoticeToProceedCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
    : IRequestHandler<UpdateNoticeToProceedCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(UpdateNoticeToProceedCommand request, CancellationToken cancellationToken)
    {
        var ntp = await unitOfWork.NoticeToProceedRepository.GetByIdAsync(request.Id, cancellationToken);
        if (ntp == null || ntp.IsDeleted)
        {
            return ApiResponse<bool>.Fail("Notice to Proceed not found.");
        }

        if (ntp.Status != NoticeToProceedStatus.Draft)
        {
            return ApiResponse<bool>.Fail($"Notice to Proceed in status '{ntp.Status}' cannot be edited. Only 'Draft' can be modified.");
        }

        var newNumber = request.NTPNumber.Trim();
        if (!string.Equals(ntp.NTPNumber, newNumber, StringComparison.OrdinalIgnoreCase))
        {
            var duplicate = await unitOfWork.NoticeToProceedRepository.FindAsync(
                n => n.Id != ntp.Id && n.NTPNumber == newNumber && n.Status != NoticeToProceedStatus.Cancelled && !n.IsDeleted,
                cancellationToken
            );
            if (duplicate != null)
            {
                return ApiResponse<bool>.Fail($"Notice to Proceed number '{newNumber}' is already in use.");
            }
            ntp.NTPNumber = newNumber;
        }

        var actorName = currentUserService.Name ?? currentUserService.Username ?? "System";

        var commencementDate = request.CommencementDate;
        var deliveryDeadline = request.DeliveryCompletionDeadline;

        if (commencementDate.HasValue && request.ImplementationPeriodDays.HasValue && !deliveryDeadline.HasValue)
        {
            deliveryDeadline = commencementDate.Value.AddDays(request.ImplementationPeriodDays.Value);
        }

        ntp.NTPDate = request.NTPDate;
        ntp.EffectivityDate = request.EffectivityDate;
        ntp.CommencementDate = commencementDate;
        ntp.ImplementationPeriodDays = request.ImplementationPeriodDays;
        ntp.DeliveryCompletionDeadline = deliveryDeadline;
        ntp.PlaceOfDelivery = request.PlaceOfDelivery?.Trim();
        ntp.Description = request.Description?.Trim();
        ntp.UpdatedAt = DateTime.UtcNow;
        ntp.UpdatedBy = actorName;

        unitOfWork.NoticeToProceedRepository.Update(ntp);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "Notice to Proceed draft updated successfully.");
    }
}
