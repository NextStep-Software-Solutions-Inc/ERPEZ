using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.UpdateNoticeOfAward;

public class UpdateNoticeOfAwardCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateNoticeOfAwardCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateNoticeOfAwardCommand command, CancellationToken cancellationToken)
    {
        var noa = await unitOfWork.NoticeOfAwardRepository.FindAsync(n => n.Id == command.Id, cancellationToken);
        if (noa == null)
        {
            return ApiResponse<Unit>.Fail("Notice of Award not found.");
        }

        if (noa.Status != NoticeOfAwardStatus.Draft && noa.Status != NoticeOfAwardStatus.Returned)
        {
            return ApiResponse<Unit>.Fail($"Notice of Award in status '{noa.Status}' cannot be modified. Only Draft or Returned NOAs can be edited.");
        }

        var req = command.Request;
        noa.NOADate = req.Date != default ? req.Date : noa.NOADate;
        noa.BidDate = req.DateBid != default ? req.DateBid : noa.BidDate;
        noa.Description = req.Description;
        noa.ProcurementType = req.Type;
        noa.UpdatedAt = DateTime.UtcNow;
        noa.UpdatedBy = command.ActorName;

        var activity = new NoticeOfAwardActivity
        {
            Id = Guid.NewGuid(),
            NoticeOfAwardId = noa.Id,
            Action = "Updated Details",
            ActorId = command.ActorId,
            ActorName = command.ActorName,
            Timestamp = DateTime.UtcNow,
            Notes = "Notice of Award details updated.",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = command.ActorName
        };

        unitOfWork.NoticeOfAwardRepository.Update(noa);
        await unitOfWork.NoticeOfAwardActivityRepository.AddAsync(activity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Notice of Award updated successfully.");
    }
}
