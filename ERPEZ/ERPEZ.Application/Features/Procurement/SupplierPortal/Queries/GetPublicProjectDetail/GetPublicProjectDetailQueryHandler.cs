using ERPEZ.Application.Features.Procurement.SupplierPortal.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetPublicProjectDetail;

public class GetPublicProjectDetailQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPublicProjectDetailQuery, ApiResponse<PublicProjectDetailDto>>
{
    private static readonly string[] allowedFallbackStatuses = ["Open", "ClosingSoon", "Published"];

    public async Task<ApiResponse<PublicProjectDetailDto>> Handle(
        GetPublicProjectDetailQuery request, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository
            .GetPublicDetailByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Project not found.");

        // Visibility gate: prefer BiddingDocument.Status once TC-02 has created one
        // for this project. Fall back to ProcurementProject.Status until the PBD
        // posting flow is live — avoids hard-gating every project to 404 before
        // TC-02 ships. Remove the fallback branch once TC-02 is fully rolled out.
        var isPubliclyVisible = project.BiddingDocument is not null
            ? project.BiddingDocument.Status == "Posted"
            : allowedFallbackStatuses.Contains(project.Status);

        if (!isPubliclyVisible)
            throw new NotFoundException("This project is not currently available on the public portal.");

        DateTime? GetDate(ProcurementActivitySystemRole role) =>
            project.BiddingActivitySchedules
                .FirstOrDefault(s => s.ProcurementActivityType?.SystemRole == role)
                ?.StartDate;

        var requiredSubmissions = project.ProjectDocumentChecklists
            .Where(c => c.IsRequired)
            .OrderBy(c => c.OrderIndex)
            .Select(c => new RequiredSubmissionDto
            {
                ChecklistItemId = c.Id,
                DocumentName    = c.MasterDocumentType?.Name ?? c.CustomDocumentName ?? string.Empty,
                Description     = c.MasterDocumentType?.Description,
                IsRequired      = c.IsRequired,
                OrderIndex      = c.OrderIndex
            }).ToList();

        var bidNotices = project.ProjectDocumentChecklists
            .Where(c => c.CustomTemplateFileUrl != null || c.MasterDocumentType?.TemplateFileUrl != null)
            .OrderBy(c => c.OrderIndex)
            .Select(c => new BidNoticeDto
            {
                ChecklistItemId = c.Id,
                DocumentName    = c.MasterDocumentType?.Name ?? c.CustomDocumentName ?? string.Empty,
                Description     = c.MasterDocumentType?.Description,
                DownloadUrl     = $"/api/public/projects/{project.Id}/bid-notices/{c.Id}/download",
                OrderIndex      = c.OrderIndex,
                PostedOn        = c.CreatedAt
            }).ToList();

        var dto = new PublicProjectDetailDto
        {
            Id                     = project.Id,
            Title                  = project.Title,
            ContractNo             = project.ContractNo ?? string.Empty,
            ABC                    = project.ABC,
            ModeOfProcurement      = project.ProcurementMode?.Name ?? string.Empty,
            Status                 = project.Status,
            ScopeOfWork            = project.ScopeOfWork,
            NonRefundableBidderFee = project.NonRefundableBidderFee,
            DeliveryPeriodDays     = project.DeliveryPeriodDays,
            SubmissionDeadline     = GetDate(ProcurementActivitySystemRole.SubmissionOpeningOfBids),
            BidOpeningDate         = GetDate(ProcurementActivitySystemRole.SubmissionOpeningOfBids),
            PreBidConferenceDate   = GetDate(ProcurementActivitySystemRole.PreBidConference),
            DatePosted             = GetDate(ProcurementActivitySystemRole.AdvertisementPosting),
            RequiredSubmissions    = requiredSubmissions,
            BidNotices             = bidNotices
        };

        return ApiResponse<PublicProjectDetailDto>.Success(dto);
    }
}