using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.DeleteNoticeOfAward;

public class DeleteNoticeOfAwardCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteNoticeOfAwardCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteNoticeOfAwardCommand command, CancellationToken cancellationToken)
    {
        var noa = await unitOfWork.NoticeOfAwardRepository.FindAsync(n => n.Id == command.Id, cancellationToken);
        if (noa == null)
        {
            return ApiResponse<Unit>.Fail("Notice of Award not found.");
        }

        if (noa.Status != NoticeOfAwardStatus.Draft)
        {
            return ApiResponse<Unit>.Fail($"Notice of Award in status '{noa.Status}' cannot be deleted. Only Draft NOAs can be deleted.");
        }

        unitOfWork.NoticeOfAwardRepository.Remove(noa);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Notice of Award draft deleted successfully.");
    }
}
