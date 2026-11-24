using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using FluentValidation;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.LogPostQualificationDocsReceived;

public class LogPostQualificationDocsReceivedCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
    : IRequestHandler<LogPostQualificationDocsReceivedCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(LogPostQualificationDocsReceivedCommand command, CancellationToken cancellationToken)
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

        var postQual = evaluatedBid.PostQualification
            ?? throw new FluentValidation.ValidationException("No post-qualification notice has been issued for this bidder yet.");

        var receivedTimestamp = command.Request.DocsReceivedAt ?? DateTime.UtcNow;
        var evaluationDays = command.Request.BacEvaluationDays > 0 ? command.Request.BacEvaluationDays : 12;
        var actorName = currentUserService.Name ?? currentUserService.Username ?? "System";

        postQual.DocsReceivedDate = receivedTimestamp;
        postQual.TargetDeadlineDate = receivedTimestamp.AddDays(evaluationDays);
        postQual.Status = "UnderEvaluation";
        postQual.UpdatedAt = DateTime.UtcNow;
        postQual.UpdatedBy = actorName;

        evaluatedBid.Status = "Under_PostQual";
        evaluatedBid.UpdatedAt = DateTime.UtcNow;
        evaluatedBid.UpdatedBy = actorName;

        unitOfWork.BiddingEvaluationRepository.Update(evaluation);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(postQual.Id, "Original post-qualification documents received. Bidder SLA stopped and BAC 12-day evaluation timer started.");
    }
}
