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

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.RecordPostQualificationResult;

public class RecordPostQualificationResultCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
    : IRequestHandler<RecordPostQualificationResultCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(RecordPostQualificationResultCommand command, CancellationToken cancellationToken)
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
            ?? throw new FluentValidation.ValidationException("No post-qualification process is active for this bidder.");

        var actorName = currentUserService.Name ?? currentUserService.Username ?? "TWG Evaluation Committee";
        var actorId = Guid.TryParse(currentUserService.UserId, out var parsedId) ? parsedId : (Guid?)null;

        postQual.Passed = command.Request.Passed;
        postQual.Findings = command.Request.Findings;
        postQual.CompletedAt = DateTime.UtcNow;
        postQual.VerifiedById = actorId ?? postQual.VerifiedById;
        postQual.VerifiedByName = actorName;
        postQual.UpdatedAt = DateTime.UtcNow;
        postQual.UpdatedBy = actorName;

        if (command.Request.Passed)
        {
            postQual.Status = "Passed";
            evaluatedBid.Status = "Passed_PostQual";
            evaluatedBid.UpdatedAt = DateTime.UtcNow;
            evaluatedBid.UpdatedBy = actorName;
        }
        else
        {
            postQual.Status = "Disqualified";
            evaluatedBid.Status = "Disqualified";
            evaluatedBid.UpdatedAt = DateTime.UtcNow;
            evaluatedBid.UpdatedBy = actorName;

            // Post-Qualification Cascade: Find the next ranked responsive evaluated bidder
            var nextRankedBidder = evaluation.EvaluatedBids
                .Where(b => b.Id != evaluatedBid.Id && b.IsResponsive && b.Status == "Ranked" && !b.IsDeleted)
                .OrderBy(b => b.Rank)
                .FirstOrDefault();

            if (nextRankedBidder != null && nextRankedBidder.PostQualification == null)
            {
                nextRankedBidder.PostQualification = new BiddingPostQualification
                {
                    BiddingEvaluatedBidId = nextRankedBidder.Id,
                    Status = "PendingDocs",
                    CreatedBy = actorName
                };
            }
        }

        unitOfWork.BiddingEvaluationRepository.Update(evaluation);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var resultMsg = command.Request.Passed
            ? "Post-qualification evaluation completed successfully. Bidder marked as Passed (eligible for award recommendation)."
            : "Post-qualification disqualified. Bidder marked as Disqualified and next-ranked bidder unlocked for post-qualification.";

        return ApiResponse<Guid>.Success(postQual.Id, resultMsg);
    }
}
