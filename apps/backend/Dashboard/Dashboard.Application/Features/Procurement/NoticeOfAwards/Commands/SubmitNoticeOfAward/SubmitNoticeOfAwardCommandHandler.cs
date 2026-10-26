using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.SubmitNoticeOfAward;

public class SubmitNoticeOfAwardCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<SubmitNoticeOfAwardCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(SubmitNoticeOfAwardCommand command, CancellationToken cancellationToken)
    {
        var noa = await unitOfWork.NoticeOfAwardRepository.FindAsync(n => n.Id == command.Id, cancellationToken);
        if (noa == null)
        {
            return ApiResponse<Unit>.Fail("Notice of Award not found.");
        }

        if (noa.Status != NoticeOfAwardStatus.Draft && noa.Status != NoticeOfAwardStatus.Returned)
        {
            return ApiResponse<Unit>.Fail($"Notice of Award in status '{noa.Status}' cannot be submitted for approval. Must be Draft or Returned.");
        }

        noa.Status = NoticeOfAwardStatus.ForApproval;
        noa.SubmittedById = command.ActorId;
        noa.SubmittedAt = DateTime.UtcNow;
        noa.UpdatedAt = DateTime.UtcNow;
        noa.UpdatedBy = command.ActorName;

        var activity = new NoticeOfAwardActivity
        {
            Id = Guid.NewGuid(),
            NoticeOfAwardId = noa.Id,
            Action = "Submitted for Approval",
            ActorId = command.ActorId,
            ActorName = command.ActorName,
            Timestamp = DateTime.UtcNow,
            Notes = "Notice of Award submitted to HoPE for approval.",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = command.ActorName
        };

        unitOfWork.NoticeOfAwardRepository.Update(noa);
        await unitOfWork.NoticeOfAwardActivityRepository.AddAsync(activity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Notice of Award submitted for HoPE approval successfully.");
    }
}
