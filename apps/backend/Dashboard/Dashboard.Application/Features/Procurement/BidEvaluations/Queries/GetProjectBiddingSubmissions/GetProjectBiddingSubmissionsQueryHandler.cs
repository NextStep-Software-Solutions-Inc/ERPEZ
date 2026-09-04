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

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Queries.GetProjectBiddingSubmissions;

public class GetProjectBiddingSubmissionsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetProjectBiddingSubmissionsQuery, ApiResponse<List<BiddingSubmissionResponse>>>
{
    public async Task<ApiResponse<List<BiddingSubmissionResponse>>> Handle(GetProjectBiddingSubmissionsQuery request, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository
            .GetByIdAsync(request.ProjectId, cancellationToken)
            ?? throw new NotFoundException("Procurement project not found.");

        var submissions = await unitOfWork.BiddingSubmissionRepository
            .GetByProjectIdWithDetailsAsync(request.ProjectId, cancellationToken);

        var response = submissions.Select(s =>
        {
            var supplier = s.Supplier;
            var opening = s.BidOpeningRecord;

            return new BiddingSubmissionResponse
            {
                Id = s.Id,
                ProcurementProjectId = s.ProcurementProjectId,
                SupplierId = s.SupplierId,
                SupplierName = supplier?.Name ?? s.PublicSupplierApplication?.CompanyName ?? "Registered Bidder",
                TinNumber = supplier?.TINNumber ?? s.PublicSupplierApplication?.TinNumber,
                PublicSupplierApplicationId = s.PublicSupplierApplicationId,
                OriginalProposedAmount = s.OriginalProposedAmount,
                BidSecurityType = s.BidSecurityType,
                BidSecurityAmount = s.BidSecurityAmount,
                BidSecurityNumber = s.BidSecurityNumber,
                BidSecurityValidityDays = s.BidSecurityValidityDays,
                SubmissionType = s.SubmissionType,
                SubmittedAt = s.SubmittedAt,
                Remarks = s.Remarks,
                OpeningRecord = opening == null ? null : new BidOpeningRecordResponse
                {
                    Id = opening.Id,
                    BiddingSubmissionId = opening.BiddingSubmissionId,
                    BiddingActivityScheduleId = opening.BiddingActivityScheduleId,
                    Envelope1Result = opening.Envelope1Result,
                    Envelope2Opened = opening.Envelope2Opened,
                    AsReadBidAmount = opening.AsReadBidAmount,
                    DisqualificationReason = opening.DisqualificationReason,
                    Remarks = opening.Remarks,
                    OpenedById = opening.OpenedById,
                    OpenedByName = opening.OpenedByName,
                    OpenedAt = opening.OpenedAt
                },
                Documents = s.PublicSupplierApplication?.UploadedDocuments.Select(d => new ApplicationDocumentDto
                {
                    Id = d.Id,
                    ChecklistItemId = d.ChecklistItemId,
                    Name = d.ChecklistItem?.MasterDocumentType?.Name ?? d.ChecklistItem?.CustomDocumentName ?? d.OriginalFileName,
                    Type = System.IO.Path.GetExtension(d.OriginalFileName).TrimStart('.').ToUpperInvariant(),
                    Size = 0,
                    UploadedAt = d.UploadedAt,
                    Url = d.BlobStorageUrl,
                    EnvelopeType = d.ChecklistItem != null && d.ChecklistItem.EnvelopeType != 0
                        ? d.ChecklistItem.EnvelopeType
                        : (d.ChecklistItem?.MasterDocumentType?.EnvelopeType ?? 1)
                }).ToList() ?? []
            };
        }).ToList();

        return ApiResponse<List<BiddingSubmissionResponse>>.Success(response);
    }
}
