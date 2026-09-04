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

        var isMearb = string.Equals(command.Request.AwardCriterion, "MEARB", StringComparison.OrdinalIgnoreCase);
        var techWeight = command.Request.TechnicalWeight ?? 70m;
        var finWeight = command.Request.FinancialWeight ?? 30m;

        // Perform calculation and ranking
        var evaluatedRows = new List<(BidderEvaluationInput Input, BidOpeningRecord Record, decimal? TechScore, decimal? NormFinScore, decimal? TotalScore, int Rank)>();

        var responsiveInputs = command.Request.Bidders.Where(b => b.IsResponsive).ToList();
        var nonResponsiveInputs = command.Request.Bidders.Where(b => !b.IsResponsive).ToList();

        if (responsiveInputs.Count > 0)
        {
            if (isMearb)
            {
                var lowestPrice = responsiveInputs.Min(b => b.EvaluatedBidPrice);
                if (lowestPrice <= 0) lowestPrice = 1;

                var scoredList = responsiveInputs.Select(input =>
                {
                    var record = validOpeningRecords[input.BidOpeningRecordId];
                    var tech = input.TechnicalScore ?? 0m;
                    var normFin = Math.Round((lowestPrice / (input.EvaluatedBidPrice > 0 ? input.EvaluatedBidPrice : 1)) * 100m, 2);
                    var total = Math.Round((tech * (techWeight / 100m)) + (normFin * (finWeight / 100m)), 2);

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
        var evaluation = await unitOfWork.BiddingEvaluationRepository
            .GetByProjectIdWithDetailsAsync(command.ProjectId, cancellationToken);
        if (evaluation == null)
        {
            evaluation = new BiddingEvaluation
            {
                ProcurementProjectId = command.ProjectId,
                AwardCriterion = isMearb ? "MEARB" : "LCRB",
                TechnicalWeight = isMearb ? techWeight : null,
                FinancialWeight = isMearb ? finWeight : null,
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
            evaluation.TechnicalWeight = isMearb ? techWeight : null;
            evaluation.FinancialWeight = isMearb ? finWeight : null;
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
