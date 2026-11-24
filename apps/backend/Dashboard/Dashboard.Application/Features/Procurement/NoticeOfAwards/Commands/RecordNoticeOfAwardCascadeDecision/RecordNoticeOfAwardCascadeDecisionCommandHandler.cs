using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.RecordNoticeOfAwardCascadeDecision;

public class RecordNoticeOfAwardCascadeDecisionCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<RecordNoticeOfAwardCascadeDecisionCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(RecordNoticeOfAwardCascadeDecisionCommand command, CancellationToken cancellationToken)
    {
        var noa = await unitOfWork.NoticeOfAwardRepository.FindAsync(n => n.Id == command.Id, cancellationToken);
        if (noa == null)
        {
            return ApiResponse<Unit>.Fail("Notice of Award not found.");
        }

        noa.CascadeTriggeredAt = DateTime.UtcNow;
        noa.CascadeTriggeredById = command.ActorId;
        noa.CascadeTriggeredByName = command.ActorName;
        noa.CascadeNote = command.Request.Note;
        noa.UpdatedAt = DateTime.UtcNow;
        noa.UpdatedBy = command.ActorName;

        var activity = new NoticeOfAwardActivity
        {
            Id = Guid.NewGuid(),
            NoticeOfAwardId = noa.Id,
            Action = "Recorded Next-Ranked Bidder Cascade Decision",
            ActorId = command.ActorId,
            ActorName = command.ActorName,
            Timestamp = DateTime.UtcNow,
            Notes = command.Request.Note,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = command.ActorName
        };

        unitOfWork.NoticeOfAwardRepository.Update(noa);
        await unitOfWork.NoticeOfAwardActivityRepository.AddAsync(activity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Cascade decision recorded successfully for BAC referral.");
    }
}
