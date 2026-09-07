using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using FluentValidation;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.SendPostQualificationNotice;

public class SendPostQualificationNoticeCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
    : IRequestHandler<SendPostQualificationNoticeCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(SendPostQualificationNoticeCommand command, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository
            .GetByIdAsync(command.ProjectId, cancellationToken)
            ?? throw new NotFoundException("Procurement project not found.");

        var evaluation = await unitOfWork.BiddingEvaluationRepository
            .GetByProjectIdWithDetailsAsync(command.ProjectId, cancellationToken)
            ?? throw new NotFoundException("No bid evaluation found for this project.");

        var evaluatedBid = evaluation.EvaluatedBids
            .FirstOrDefault(b => b.Id == command.Request.BiddingEvaluatedBidId && !b.IsDeleted)
            ?? throw new NotFoundException("Evaluated bidder not found.");

        var noticeTimestamp = command.Request.NoticeSentAt ?? DateTime.UtcNow;
        var deadlineDays = command.Request.TargetDays > 0 ? command.Request.TargetDays : 5;
        var actorName = currentUserService.Name ?? currentUserService.Username ?? "System";

        var postQual = evaluatedBid.PostQualification;
        if (postQual == null)
        {
            postQual = new BiddingPostQualification
            {
                BiddingEvaluatedBidId = evaluatedBid.Id,
                PostQualificationNoticeSentAt = noticeTimestamp,
                TargetDeadlineDate = noticeTimestamp.AddDays(deadlineDays),
                Status = "PendingDocs",
                CreatedBy = actorName
            };

            evaluatedBid.PostQualification = postQual;
        }
        else
        {
            postQual.PostQualificationNoticeSentAt = noticeTimestamp;
            postQual.TargetDeadlineDate = noticeTimestamp.AddDays(deadlineDays);
            postQual.Status = "PendingDocs";
            postQual.UpdatedAt = DateTime.UtcNow;
            postQual.UpdatedBy = actorName;
        }

        evaluatedBid.Status = "Under_PostQual";
        evaluatedBid.UpdatedAt = DateTime.UtcNow;
        evaluatedBid.UpdatedBy = actorName;

        unitOfWork.BiddingEvaluationRepository.Update(evaluation);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(postQual.Id, "Post-qualification notice recorded and 5-day bidder document submission timer started.");
    }
}
