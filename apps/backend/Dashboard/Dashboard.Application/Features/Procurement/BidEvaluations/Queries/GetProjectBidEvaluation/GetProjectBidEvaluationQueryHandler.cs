using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.BidEvaluations.Dtos;
using ERPEZ.Application.Features.Procurement.Projects.Queries.GetProjectSupplierApplications;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Queries.GetProjectBidEvaluation;

public class GetProjectBidEvaluationQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetProjectBidEvaluationQuery, ApiResponse<BiddingEvaluationResponse>>
{
    public async Task<ApiResponse<BiddingEvaluationResponse>> Handle(GetProjectBidEvaluationQuery request, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository
            .GetByIdAsync(request.ProjectId, cancellationToken)
            ?? throw new NotFoundException("Procurement project not found.");

        var evaluation = await unitOfWork.BiddingEvaluationRepository
            .GetByProjectIdWithDetailsAsync(request.ProjectId, cancellationToken);

        var awardRecommendations = await unitOfWork.BiddingAwardRecommendationRepository
            .FindAllAsync(a => a.ProcurementProjectId == request.ProjectId && !a.IsDeleted, cancellationToken);

        var awardRec = awardRecommendations.FirstOrDefault();

        var response = new BiddingEvaluationResponse
        {
            Id = evaluation?.Id ?? Guid.Empty,
            ProcurementProjectId = project.Id,
            ProjectName = project.Title,
            ABC = project.ABC,
            AwardCriterion = evaluation?.AwardCriterion ?? string.Empty,
            TechnicalWeight = evaluation?.TechnicalWeight,
            FinancialWeight = evaluation?.FinancialWeight,
            Status = evaluation?.Status ?? "Draft",
            EvaluatedById = evaluation?.EvaluatedById,
            EvaluatedByName = evaluation?.EvaluatedByName,
            EvaluatedAt = evaluation?.EvaluatedAt,
            Remarks = evaluation?.Remarks
        };

        if (awardRec != null)
        {
            var winningSupplier = await unitOfWork.SupplierRepository
                .GetByIdAsync(awardRec.WinningSupplierId, cancellationToken);

            var awardBacRes = project.BACResolutions
                .FirstOrDefault(r => r.BiddingAwardRecommendationId == awardRec.Id || string.Equals(r.ResolutionType, "award-recommendation", StringComparison.OrdinalIgnoreCase));

            response.AwardRecommendation = new BiddingAwardRecommendationResponse
            {
                Id = awardRec.Id,
                ProcurementProjectId = awardRec.ProcurementProjectId,
                WinningSupplierId = awardRec.WinningSupplierId,
                WinningSupplierName = winningSupplier?.Name ?? "Winning Supplier",
                BiddingPostQualificationId = awardRec.BiddingPostQualificationId,
                AwardedAmount = awardRec.AwardedAmount,
                AwardCriterion = awardRec.AwardCriterion,
                RecommendedAt = awardRec.RecommendedAt,
                RecommendedById = awardRec.RecommendedById,
                RecommendedByName = awardRec.RecommendedByName,
                Remarks = awardRec.Remarks,
                ResolutionNumber = awardBacRes?.ResolutionNumber
            };
        }

        if (evaluation != null && evaluation.EvaluatedBids.Count > 0)
        {
            response.EvaluatedBids = evaluation.EvaluatedBids
                .OrderBy(b => b.Rank)
                .Select(b =>
                {
                    var supplier = b.Supplier;
                    var opening = b.BidOpeningRecord;
                    var postQual = b.PostQualification;
                    var submission = opening?.BiddingSubmission;
                    var appDocs = submission?.PublicSupplierApplication?.UploadedDocuments;
                    var documents = appDocs?.Select(d => new ApplicationDocumentDto
                    {
                        Id = d.Id,
                        ChecklistItemId = d.ChecklistItemId,
                        Name = d.ChecklistItem?.MasterDocumentType?.Name ?? d.ChecklistItem?.CustomDocumentName ?? d.OriginalFileName,
                        EnvelopeType = d.ChecklistItem?.EnvelopeType ?? 1,
                        Url = d.BlobStorageUrl,
                        UploadedAt = d.UploadedAt
                    }).ToList() ?? [];

                    return new BiddingEvaluatedBidResponse
                    {
                        Id = b.Id,
                        BiddingEvaluationId = b.BiddingEvaluationId,
                        BidOpeningRecordId = b.BidOpeningRecordId,
                        SupplierId = b.SupplierId,
                        SupplierName = supplier?.Name ?? "Unknown Supplier",
                        OriginalProposedAmount = opening?.BiddingSubmission?.OriginalProposedAmount ?? b.EvaluatedBidPrice,
                        AsReadBidAmount = opening?.AsReadBidAmount,
                        EvaluatedBidPrice = b.EvaluatedBidPrice,
                        TechnicalScore = b.TechnicalScore,
                        NormalizedFinancialScore = b.NormalizedFinancialScore,
                        TotalScore = b.TotalScore,
                        Rank = b.Rank,
                        Status = b.Status,
                        IsResponsive = b.IsResponsive,
                        NonResponsiveReason = b.NonResponsiveReason,
                        PostQualification = postQual == null ? null : new BiddingPostQualificationResponse
                        {
                            Id = postQual.Id,
                            BiddingEvaluatedBidId = postQual.BiddingEvaluatedBidId,
                            PostQualificationNoticeSentAt = postQual.PostQualificationNoticeSentAt,
                            DocsReceivedDate = postQual.DocsReceivedDate,
                            TargetDeadlineDate = postQual.TargetDeadlineDate,
                            Passed = postQual.Passed,
                            Status = postQual.Status,
                            Findings = postQual.Findings,
                            VerifiedById = postQual.VerifiedById,
                            VerifiedByName = postQual.VerifiedByName,
                            CompletedAt = postQual.CompletedAt
                        },
                        Documents = documents
                    };
                }).ToList();
        }
        else
        {
            // If evaluation hasn't been executed yet, list passing opened bids in draft format
            var submissions = await unitOfWork.BiddingSubmissionRepository
                .GetByProjectIdWithDetailsAsync(request.ProjectId, cancellationToken);

            var passingSubmissions = submissions
                .Where(s => s.BidOpeningRecord != null && string.Equals(s.BidOpeningRecord.Envelope1Result, "Passed", StringComparison.OrdinalIgnoreCase))
                .ToList();

            response.EvaluatedBids = passingSubmissions.Select((s, index) => new BiddingEvaluatedBidResponse
            {
                Id = Guid.Empty,
                BiddingEvaluationId = Guid.Empty,
                BidOpeningRecordId = s.BidOpeningRecord!.Id,
                SupplierId = s.SupplierId,
                SupplierName = s.Supplier?.Name ?? "Registered Bidder",
                OriginalProposedAmount = s.OriginalProposedAmount,
                AsReadBidAmount = s.BidOpeningRecord.AsReadBidAmount,
                EvaluatedBidPrice = s.BidOpeningRecord.AsReadBidAmount ?? s.OriginalProposedAmount,
                Rank = index + 1,
                Status = "Ranked",
                IsResponsive = true,
                Documents = s.PublicSupplierApplication?.UploadedDocuments?.Select(d => new ApplicationDocumentDto
                {
                    Id = d.Id,
                    ChecklistItemId = d.ChecklistItemId,
                    Name = d.ChecklistItem?.MasterDocumentType?.Name ?? d.ChecklistItem?.CustomDocumentName ?? d.OriginalFileName,
                    EnvelopeType = d.ChecklistItem?.EnvelopeType ?? 1,
                    Url = d.BlobStorageUrl,
                    UploadedAt = d.UploadedAt
                }).ToList() ?? []
            }).ToList();
        }

        return ApiResponse<BiddingEvaluationResponse>.Success(response);
    }
}
