using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.ReturnNoticeOfAward;

public class ReturnNoticeOfAwardCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<ReturnNoticeOfAwardCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(ReturnNoticeOfAwardCommand command, CancellationToken cancellationToken)
    {
        var noa = await unitOfWork.NoticeOfAwardRepository.FindAsync(n => n.Id == command.Id, cancellationToken);
        if (noa == null)
        {
            return ApiResponse<Unit>.Fail("Notice of Award not found.");
        }

        if (noa.Status != NoticeOfAwardStatus.ForApproval)
        {
            return ApiResponse<Unit>.Fail($"Notice of Award in status '{noa.Status}' cannot be returned. Must be 'ForApproval'.");
        }

        noa.Status = NoticeOfAwardStatus.Returned;
        noa.ReturnReason = command.Request.Remarks;
        noa.UpdatedAt = DateTime.UtcNow;
        noa.UpdatedBy = command.ActorName;

        var activity = new NoticeOfAwardActivity
        {
            Id = Guid.NewGuid(),
            NoticeOfAwardId = noa.Id,
            Action = "Returned for Revision",
            ActorId = command.ActorId,
            ActorName = command.ActorName,
            Timestamp = DateTime.UtcNow,
            Notes = command.Request.Remarks,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = command.ActorName
        };

        unitOfWork.NoticeOfAwardRepository.Update(noa);
        await unitOfWork.NoticeOfAwardActivityRepository.AddAsync(activity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Notice of Award returned to Procurement Staff for revision.");
    }
}
