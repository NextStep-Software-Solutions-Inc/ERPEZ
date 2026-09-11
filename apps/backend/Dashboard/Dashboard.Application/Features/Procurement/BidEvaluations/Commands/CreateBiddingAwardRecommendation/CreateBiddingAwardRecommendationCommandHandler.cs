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

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.CreateBiddingAwardRecommendation;

public class CreateBiddingAwardRecommendationCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
    : IRequestHandler<CreateBiddingAwardRecommendationCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateBiddingAwardRecommendationCommand command, CancellationToken cancellationToken)
    {
        // 1. Validate project exists
        var project = await unitOfWork.ProcurementProjectRepository
            .GetByIdAsync(command.ProjectId, cancellationToken)
            ?? throw new NotFoundException("Procurement project not found.");

        // 2. Validate evaluation exists and is completed
        var evaluation = await unitOfWork.BiddingEvaluationRepository
            .GetByProjectIdWithDetailsAsync(command.ProjectId, cancellationToken)
            ?? throw new NotFoundException("No bid evaluation found for this project.");

        if (!string.Equals(evaluation.Status, "Completed", StringComparison.OrdinalIgnoreCase))
        {
            throw new FluentValidation.ValidationException("Bid evaluation must be completed before creating an award recommendation.");
        }

        // 3. Find target evaluated bid owning the post-qualification record
        var evaluatedBid = evaluation.EvaluatedBids
            .FirstOrDefault(b => b.PostQualification != null && b.PostQualification.Id == command.Request.BiddingPostQualificationId && !b.IsDeleted)
            ?? throw new NotFoundException("Referenced post-qualification record was not found in this project's evaluation.");

        var postQual = evaluatedBid.PostQualification!;

        // 4. Invariant: Post-qualification must be Passed
        if (postQual.Passed != true || !string.Equals(postQual.Status, "Passed", StringComparison.OrdinalIgnoreCase))
        {
            throw new FluentValidation.ValidationException("Cannot recommend for award: The bidder has not successfully passed post-qualification verification.");
        }

        // 5. Invariant: Evaluated bid must be responsive
        if (!evaluatedBid.IsResponsive || !string.Equals(evaluatedBid.Status, "Passed_PostQual", StringComparison.OrdinalIgnoreCase))
        {
            throw new FluentValidation.ValidationException("Cannot recommend for award: The evaluated bidder is marked as non-responsive or disqualified.");
        }

        var actorName = currentUserService.Name ?? currentUserService.Username ?? "BAC Chairperson";
        var actorId = Guid.TryParse(currentUserService.UserId, out var parsedId) ? parsedId : (Guid?)null;

        // 6. Check existing award recommendations for project
        var existingAwardRecs = await unitOfWork.BiddingAwardRecommendationRepository
            .FindAllAsync(a => a.ProcurementProjectId == command.ProjectId && !a.IsDeleted, cancellationToken);

        var awardRec = existingAwardRecs.FirstOrDefault();
        if (awardRec == null)
        {
            awardRec = new BiddingAwardRecommendation
            {
                ProcurementProjectId = command.ProjectId,
                WinningSupplierId = evaluatedBid.SupplierId,
                BiddingPostQualificationId = postQual.Id,
                AwardedAmount = evaluatedBid.EvaluatedBidPrice,
                AwardCriterion = evaluation.AwardCriterion,
                RecommendedAt = DateTime.UtcNow,
                RecommendedById = actorId,
                RecommendedByName = actorName,
                Remarks = command.Request.Remarks,
                CreatedBy = actorName
            };

            await unitOfWork.BiddingAwardRecommendationRepository.AddAsync(awardRec, cancellationToken);
        }
        else
        {
            awardRec.WinningSupplierId = evaluatedBid.SupplierId;
            awardRec.BiddingPostQualificationId = postQual.Id;
            awardRec.AwardedAmount = evaluatedBid.EvaluatedBidPrice;
            awardRec.AwardCriterion = evaluation.AwardCriterion;
            awardRec.RecommendedAt = DateTime.UtcNow;
            awardRec.RecommendedById = actorId ?? awardRec.RecommendedById;
            awardRec.RecommendedByName = actorName;
            awardRec.Remarks = command.Request.Remarks;
            awardRec.UpdatedAt = DateTime.UtcNow;
            awardRec.UpdatedBy = actorName;
        }

        // Link with any existing Award BAC Resolution on this project
        var projectResolutions = await unitOfWork.BACResolutionRepository.FindAllAsync(
            r => r.ProcurementProjectId == command.ProjectId && !r.IsDeleted,
            cancellationToken
        );
        var awardBacRes = projectResolutions.FirstOrDefault(
            r => string.Equals(r.ResolutionType, "award-recommendation", StringComparison.OrdinalIgnoreCase)
        );

        if (awardBacRes != null)
        {
            awardBacRes.BiddingAwardRecommendationId = awardRec.Id;
            awardBacRes.UpdatedAt = DateTime.UtcNow;
            awardBacRes.UpdatedBy = actorName;
            unitOfWork.BACResolutionRepository.Update(awardBacRes);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(awardRec.Id, "Bidding award recommendation created successfully.");
    }
}
