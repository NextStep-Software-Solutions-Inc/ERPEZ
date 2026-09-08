using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.RecordNoticeOfAwardJustification;

public class RecordNoticeOfAwardJustificationCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<RecordNoticeOfAwardJustificationCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(RecordNoticeOfAwardJustificationCommand command, CancellationToken cancellationToken)
    {
        var noa = await unitOfWork.NoticeOfAwardRepository.FindAsync(n => n.Id == command.Id, cancellationToken);
        if (noa == null)
        {
            return ApiResponse<Unit>.Fail("Notice of Award not found.");
        }

        noa.ContractExecutionJustification = command.Request.Justification;
        noa.JustificationLoggedAt = DateTime.UtcNow;
        noa.UpdatedAt = DateTime.UtcNow;
        noa.UpdatedBy = command.ActorName;

        var activity = new NoticeOfAwardActivity
        {
            Id = Guid.NewGuid(),
            NoticeOfAwardId = noa.Id,
            Action = "Logged Overdue SLA Justification",
            ActorId = command.ActorId,
            ActorName = command.ActorName,
            Timestamp = DateTime.UtcNow,
            Notes = command.Request.Justification,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = command.ActorName
        };

        unitOfWork.NoticeOfAwardRepository.Update(noa);
        await unitOfWork.NoticeOfAwardActivityRepository.AddAsync(activity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Overdue SLA justification logged successfully.");
    }
}
