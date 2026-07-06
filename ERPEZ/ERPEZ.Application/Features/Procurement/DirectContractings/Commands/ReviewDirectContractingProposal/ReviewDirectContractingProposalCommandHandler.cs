using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

using ERPEZ.Application.Interfaces;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.ReviewDirectContractingProposal;

public class ReviewDirectContractingProposalCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    : IRequestHandler<ReviewDirectContractingProposalCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(ReviewDirectContractingProposalCommand command, CancellationToken cancellationToken)
    {
        var dc = await unitOfWork.DirectContractingRepository.Query()
            .FirstOrDefaultAsync(x => x.Id == command.DirectContractingId && !x.IsDeleted, cancellationToken);

        if (dc == null)
        {
            return ApiResponse<Unit>.Fail("Direct Contracting request not found.");
        }

        if (dc.Status != ERPEZ.Domain.Enums.DirectContractingStatusEnum.PENDING_FOR_APPROVAL)
        {
            return ApiResponse<Unit>.Fail($"Direct Contracting request must be PENDING_FOR_APPROVAL status for review. Current status is {dc.Status}.");
        }

        Guid? reviewedByUserId = null;
        if (Guid.TryParse(currentUserService.UserId, out var actorId))
        {
            reviewedByUserId = actorId;
        }

        dc.ReviewedByUserId = reviewedByUserId;
        dc.ReviewRemarks = command.Remarks;

        if (command.Action == ReviewAction.Approved)
        {
            dc.Status = ERPEZ.Domain.Enums.DirectContractingStatusEnum.APPROVED;
        }
        else if (command.Action == ReviewAction.Returned)
        {
            dc.Status = ERPEZ.Domain.Enums.DirectContractingStatusEnum.RETURNED;
        }

        unitOfWork.DirectContractingRepository.Update(dc);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Direct Contracting proposal has been {command.Action.ToString().ToLower()} successfully.");
    }
}
