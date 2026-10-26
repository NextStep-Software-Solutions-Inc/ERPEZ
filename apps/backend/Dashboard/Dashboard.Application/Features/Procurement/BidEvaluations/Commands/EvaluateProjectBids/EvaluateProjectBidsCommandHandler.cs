using System;
using System.Collections.Generic;
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

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.EvaluateProjectBids;

public class EvaluateProjectBidsCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
    : IRequestHandler<EvaluateProjectBidsCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(EvaluateProjectBidsCommand command, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository
            .GetByIdAsync(command.ProjectId, cancellationToken)
            ?? throw new NotFoundException("Procurement project not found.");

        // 1. Re-Evaluation Safeguards
        var evaluation = await unitOfWork.BiddingEvaluationRepository
            .GetByProjectIdWithDetailsAsync(command.ProjectId, cancellationToken);

        if (evaluation != null)
        {
            var awardRecs = await unitOfWork.BiddingAwardRecommendationRepository
                .FindAllAsync(a => a.ProcurementProjectId == command.ProjectId && !a.IsDeleted, cancellationToken);
            if (awardRecs.Any())
            {
                throw new FluentValidation.ValidationException("Cannot re-evaluate bids: An award recommendation has already been established for this project.");
            }

            if (evaluation.EvaluatedBids.Any(b => b.Status == "Passed_PostQual" || b.PostQualification?.Status == "Passed" || b.PostQualification?.Passed == true))
            {
                throw new FluentValidation.ValidationException("Cannot re-evaluate bids: A candidate has already successfully passed post-qualification verification.");
            }

            if (evaluation.EvaluatedBids.Any(b => b.PostQualification?.Status == "Disqualified" || b.PostQualification?.Passed == false))
            {
                throw new FluentValidation.ValidationException("Cannot re-evaluate bids: Post-qualification has already been concluded for one or more candidates.");
            }
        }

        // 2. Validate criterion presence - no silent fallback
        if (string.IsNullOrWhiteSpace(command.Request.AwardCriterion))
        {
            throw new FluentValidation.ValidationException("Bid evaluation criterion has not been established for this procurement project.");
        }

        var criterion = command.Request.AwardCriterion.Trim();

        // 3. Validate against project procurement mode / category
        var mode = project.ProcurementModeId.HasValue
            ? await unitOfWork.ProcurementModeRepository.GetByIdAsync(project.ProcurementModeId.Value, cancellationToken)
            : null;

        var isConsulting = mode != null && (
            string.Equals(mode.Name, "Consulting Services", StringComparison.OrdinalIgnoreCase) ||
            mode.Name.Contains("Consulting", StringComparison.OrdinalIgnoreCase)
        );

        if (isConsulting && string.Equals(criterion, "LCRB", StringComparison.OrdinalIgnoreCase))
        {
            throw new FluentValidation.ValidationException("Lowest Calculated Responsive Bid (LCRB) is not applicable to Consulting Services.");
        }

        var isLcrb = string.Equals(criterion, "LCRB", StringComparison.OrdinalIgnoreCase);
        var isMearb = string.Equals(criterion, "MEARB", StringComparison.OrdinalIgnoreCase);
        var isMarbOrHrrb = string.Equals(criterion, "MARB", StringComparison.OrdinalIgnoreCase) ||
                           string.Equals(criterion, "HRRB", StringComparison.OrdinalIgnoreCase) ||
                           string.Equals(criterion, "MARB_HRRB_SRRB", StringComparison.OrdinalIgnoreCase) ||
                           string.Equals(criterion, "SRRB", StringComparison.OrdinalIgnoreCase);
        var isLccrb = string.Equals(criterion, "LCCRB", StringComparison.OrdinalIgnoreCase);

        decimal? techWeight = null;
        decimal? finWeight = null;

        if (isMearb)
        {
            if (!command.Request.TechnicalWeight.HasValue || !command.Request.FinancialWeight.HasValue ||
                command.Request.TechnicalWeight.Value + command.Request.FinancialWeight.Value != 100m)
            {
                throw new FluentValidation.ValidationException("Most Economically Advantageous Responsive Bid (MEARB) requires valid Technical and Financial weights that sum to 100%.");
            }

            techWeight = command.Request.TechnicalWeight.Value;
            finWeight = command.Request.FinancialWeight.Value;
        }
        else if (isMarbOrHrrb)
        {
            throw new FluentValidation.ValidationException($"The evaluation methodology for criterion '{criterion}' is not currently implemented in the evaluation engine.");
        }
        else if (isLccrb)
        {
            throw new FluentValidation.ValidationException("The evaluation methodology for Life-Cycle Costing (LCCRB) is not currently implemented in the evaluation engine.");
        }
        else if (!isLcrb)
        {
            throw new FluentValidation.ValidationException($"Unsupported bid evaluation criterion '{criterion}'.");
        }

        // Safeguard: Prevent changing AwardCriterion, TechnicalWeight, or FinancialWeight after a completed evaluation
        if (evaluation != null && string.Equals(evaluation.Status, "Completed", StringComparison.OrdinalIgnoreCase))
        {
            if (!string.Equals(evaluation.AwardCriterion, criterion, StringComparison.OrdinalIgnoreCase))
            {
                throw new FluentValidation.ValidationException(
                    $"Cannot change evaluation criterion from '{evaluation.AwardCriterion}' to '{criterion}' for a completed bid evaluation.");
            }

            if (isMearb)
            {
                if (evaluation.TechnicalWeight != techWeight || evaluation.FinancialWeight != finWeight)
                {
                    throw new FluentValidation.ValidationException(
                        $"Cannot change MEARB weights after evaluation has been completed. Existing methodology is locked at {evaluation.TechnicalWeight}% Technical / {evaluation.FinancialWeight}% Financial.");
                }
            }
        }

        // 4. Validate bidders presence
        if (command.Request.Bidders == null || command.Request.Bidders.Count == 0)
        {
            throw new FluentValidation.ValidationException("At least one bidder evaluation input is required.");
        }

        // Retrieve valid submissions and opening records for this project
        var submissions = await unitOfWork.BiddingSubmissionRepository
            .GetByProjectIdWithDetailsAsync(command.ProjectId, cancellationToken);

        var validOpeningRecords = submissions
            .Where(s => s.BidOpeningRecord != null && string.Equals(s.BidOpeningRecord.Envelope1Result, "Passed", StringComparison.OrdinalIgnoreCase))
            .Select(s => s.BidOpeningRecord!)
            .ToDictionary(o => o.Id);

        if (validOpeningRecords.Count == 0)
        {
            throw new FluentValidation.ValidationException("No passing bid opening records found for evaluation in this project.");
        }

        // Validate all input opening record IDs
        foreach (var input in command.Request.Bidders)
        {
            if (!validOpeningRecords.TryGetValue(input.BidOpeningRecordId, out _))
            {
                throw new FluentValidation.ValidationException($"Invalid opening record ID '{input.BidOpeningRecordId}' for this project.");
            }
        }

        // Perform calculation and ranking
        var evaluatedRows = new List<(BidderEvaluationInput Input, BidOpeningRecord Record, decimal? TechScore, decimal? NormFinScore, decimal? TotalScore, int Rank)>();

        var responsiveInputs = command.Request.Bidders.Where(b => b.IsResponsive).ToList();
        var nonResponsiveInputs = command.Request.Bidders.Where(b => !b.IsResponsive).ToList();

        if (responsiveInputs.Count > 0)
        {
            if (isMearb)
            {
                // Explicit technical score validation for MEARB
                foreach (var input in responsiveInputs)
                {
                    if (!input.TechnicalScore.HasValue)
                    {
                        var record = validOpeningRecords[input.BidOpeningRecordId];
                        var supplierName = record.BiddingSubmission?.Supplier?.Name ?? "Responsive bidder";
                        throw new FluentValidation.ValidationException($"Technical score is required for all responsive bidders under MEARB evaluation. Missing score for bidder '{supplierName}'.");
                    }

                    if (input.TechnicalScore.Value < 0m || input.TechnicalScore.Value > 100m)
                    {
                        var record = validOpeningRecords[input.BidOpeningRecordId];
                        var supplierName = record.BiddingSubmission?.Supplier?.Name ?? "Responsive bidder";
                        throw new FluentValidation.ValidationException($"Technical score for bidder '{supplierName}' must be between 0 and 100.");
                    }
                }

                var lowestPrice = responsiveInputs.Min(b => b.EvaluatedBidPrice);
                if (lowestPrice <= 0) lowestPrice = 1;

                var scoredList = responsiveInputs.Select(input =>
                {
                    var record = validOpeningRecords[input.BidOpeningRecordId];
                    var tech = input.TechnicalScore!.Value;
                    var normFin = Math.Round((lowestPrice / (input.EvaluatedBidPrice > 0 ? input.EvaluatedBidPrice : 1)) * 100m, 2);
                    var total = Math.Round((tech * (techWeight!.Value / 100m)) + (normFin * (finWeight!.Value / 100m)), 2);

                    return (Input: input, Record: record, TechScore: (decimal?)tech, NormFinScore: (decimal?)normFin, TotalScore: (decimal?)total);
                }).OrderByDescending(x => x.TotalScore).ToList();

                for (int i = 0; i < scoredList.Count; i++)
                {
                    var item = scoredList[i];
                    evaluatedRows.Add((item.Input, item.Record, item.TechScore, item.NormFinScore, item.TotalScore, i + 1));
                }
            }
            else
            {
                // LCRB: Ascending by EvaluatedBidPrice
                var sortedList = responsiveInputs
                    .Select(input => (Input: input, Record: validOpeningRecords[input.BidOpeningRecordId]))
                    .OrderBy(x => x.Input.EvaluatedBidPrice)
                    .ToList();

                for (int i = 0; i < sortedList.Count; i++)
                {
                    var item = sortedList[i];
                    evaluatedRows.Add((item.Input, item.Record, null, null, null, i + 1));
                }
            }
        }

        // Append non-responsive bidders at the end
        int nextRank = evaluatedRows.Count + 1;
        foreach (var nonResp in nonResponsiveInputs)
        {
            var record = validOpeningRecords[nonResp.BidOpeningRecordId];
            evaluatedRows.Add((nonResp, record, nonResp.TechnicalScore, null, null, nextRank++));
        }

        var actorName = currentUserService.Name ?? currentUserService.Username ?? "BAC Evaluation Committee";
        var actorId = Guid.TryParse(currentUserService.UserId, out var parsedId) ? parsedId : (Guid?)null;

        // Find or create BiddingEvaluation aggregate root
        if (evaluation == null)
        {
            evaluation = new BiddingEvaluation
            {
                ProcurementProjectId = command.ProjectId,
                AwardCriterion = isMearb ? "MEARB" : "LCRB",
                TechnicalWeight = techWeight,
                FinancialWeight = finWeight,
                Status = "Completed",
                EvaluatedById = actorId,
                EvaluatedByName = actorName,
                EvaluatedAt = DateTime.UtcNow,
                Remarks = command.Request.Remarks,
                CreatedBy = actorName
            };

            await unitOfWork.BiddingEvaluationRepository.AddAsync(evaluation, cancellationToken);
        }
        else
        {
            evaluation.AwardCriterion = isMearb ? "MEARB" : "LCRB";
            evaluation.TechnicalWeight = techWeight;
            evaluation.FinancialWeight = finWeight;
            evaluation.Status = "Completed";
            evaluation.EvaluatedById = actorId ?? evaluation.EvaluatedById;
            evaluation.EvaluatedByName = actorName;
            evaluation.EvaluatedAt = DateTime.UtcNow;
            evaluation.Remarks = command.Request.Remarks;
            evaluation.UpdatedAt = DateTime.UtcNow;
            evaluation.UpdatedBy = actorName;
        }

        // Update/create child EvaluatedBids
        foreach (var row in evaluatedRows)
        {
            var supplierId = row.Record.BiddingSubmission?.SupplierId
                ?? submissions.First(s => s.BidOpeningRecord?.Id == row.Record.Id).SupplierId;
            var evaluatedBid = evaluation.EvaluatedBids
                .FirstOrDefault(b => b.SupplierId == supplierId);

            var status = !row.Input.IsResponsive 
                ? "Disqualified" 
                : (evaluatedBid?.Status ?? "Ranked");

            if (evaluatedBid == null)
            {
                evaluatedBid = new BiddingEvaluatedBid
                {
                    BiddingEvaluationId = evaluation.Id,
                    BidOpeningRecordId = row.Record.Id,
                    SupplierId = supplierId,
                    EvaluatedBidPrice = row.Input.EvaluatedBidPrice,
                    TechnicalScore = row.TechScore,
                    NormalizedFinancialScore = row.NormFinScore,
                    TotalScore = row.TotalScore,
                    Rank = row.Rank,
                    Status = status,
                    IsResponsive = row.Input.IsResponsive,
                    NonResponsiveReason = row.Input.NonResponsiveReason,
                    CreatedBy = actorName
                };

                evaluation.EvaluatedBids.Add(evaluatedBid);
            }
            else
            {
                evaluatedBid.BidOpeningRecordId = row.Record.Id;
                evaluatedBid.EvaluatedBidPrice = row.Input.EvaluatedBidPrice;
                evaluatedBid.TechnicalScore = row.TechScore;
                evaluatedBid.NormalizedFinancialScore = row.NormFinScore;
                evaluatedBid.TotalScore = row.TotalScore;
                evaluatedBid.Rank = row.Rank;
                evaluatedBid.Status = status;
                evaluatedBid.IsResponsive = row.Input.IsResponsive;
                evaluatedBid.NonResponsiveReason = row.Input.NonResponsiveReason;
                evaluatedBid.UpdatedAt = DateTime.UtcNow;
                evaluatedBid.UpdatedBy = actorName;
            }

            // Auto-initialize Post-Qualification record for Rank #1 if not present
            if (row.Rank == 1 && row.Input.IsResponsive && evaluatedBid.PostQualification == null)
            {
                evaluatedBid.PostQualification = new BiddingPostQualification
                {
                    BiddingEvaluatedBidId = evaluatedBid.Id,
                    Status = "PendingDocs",
                    CreatedBy = actorName
                };
            }
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(evaluation.Id, "Bid evaluation completed and rankings calculated successfully.");
    }
}
