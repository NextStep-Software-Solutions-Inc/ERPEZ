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

        Dictionary<Guid, (string Name, string? Description)> itemMetadata = new();
        if (project.ConsolidatedPRId.HasValue)
        {
            var cpr = await unitOfWork.ConsolidatedPRRepository
                .GetCPRWithDetailsAsync(project.ConsolidatedPRId.Value, cancellationToken);

            if (cpr?.ConsolidatedPRItems != null)
            {
                foreach (var ci in cpr.ConsolidatedPRItems.Where(ci => !ci.IsDeleted && ci.PRItem != null))
                {
                    itemMetadata[ci.Id] = (ci.PRItem.Name, ci.PRItem.Description ?? ci.PRItem.PPMPItem?.Description);
                }
            }
        }

        var response = submissions.Select(s =>
        {
            var supplier = s.Supplier;
            var opening = s.BidOpeningRecord;
            var isEnv2Opened = opening != null && opening.Envelope1Result == "Passed" && opening.Envelope2Opened;

            return new BiddingSubmissionResponse
            {
                Id = s.Id,
                ProcurementProjectId = s.ProcurementProjectId,
                SupplierId = s.SupplierId,
                SupplierName = supplier?.Name ?? s.PublicSupplierApplication?.CompanyName ?? "Registered Bidder",
                TinNumber = supplier?.TINNumber ?? s.PublicSupplierApplication?.TinNumber,
                PublicSupplierApplicationId = s.PublicSupplierApplicationId,
                OriginalProposedAmount = isEnv2Opened ? s.OriginalProposedAmount : null,
                IsFinancialOpened = isEnv2Opened,
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
                Documents = s.PublicSupplierApplication?.UploadedDocuments.Select(d =>
                {
                    var envType = d.ChecklistItem != null && d.ChecklistItem.EnvelopeType != 0
                        ? d.ChecklistItem.EnvelopeType
                        : (d.ChecklistItem?.MasterDocumentType?.EnvelopeType ?? 1);

                    return new ApplicationDocumentDto
                    {
                        Id = d.Id,
                        ChecklistItemId = d.ChecklistItemId,
                        Name = d.ChecklistItem?.MasterDocumentType?.Name ?? d.ChecklistItem?.CustomDocumentName ?? d.OriginalFileName,
                        Type = System.IO.Path.GetExtension(d.OriginalFileName).TrimStart('.').ToUpperInvariant(),
                        Size = 0,
                        UploadedAt = d.UploadedAt,
                        Url = envType == 2 && !isEnv2Opened ? null : d.BlobStorageUrl,
                        EnvelopeType = envType
                    };
                }).ToList() ?? [],
                Items = isEnv2Opened && s.BiddingSubmissionItems != null && s.BiddingSubmissionItems.Count > 0
                    ? s.BiddingSubmissionItems.Where(i => !i.IsDeleted).Select(i =>
                    {
                        itemMetadata.TryGetValue(i.ProcurementProjectItemId, out var meta);
                        return new BiddingSubmissionItemResponse
                        {
                            Id = i.Id,
                            BiddingSubmissionId = i.BiddingSubmissionId,
                            ProcurementProjectItemId = i.ProcurementProjectItemId,
                            ItemName = meta.Name,
                            Description = meta.Description,
                            Quantity = i.Quantity,
                            Uom = i.Uom,
                            UnitPrice = i.UnitPrice,
                            TotalPrice = i.TotalPrice,
                            Brand = i.Brand,
                            Model = i.Model
                        };
                    }).ToList()
                    : null
            };
        }).ToList();

        return ApiResponse<List<BiddingSubmissionResponse>>.Success(response);
    }
}
