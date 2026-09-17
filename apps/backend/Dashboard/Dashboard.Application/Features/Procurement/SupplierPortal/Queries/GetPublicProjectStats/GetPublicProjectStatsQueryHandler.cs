using ERPEZ.Application.Features.Procurement.SupplierPortal.Dtos;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetPublicProjects;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetPublicProjectStats;

public class GetPublicProjectStatsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPublicProjectStatsQuery, ApiResponse<PublicProjectStatsDto>>
{
    public async Task<ApiResponse<PublicProjectStatsDto>> Handle(
        GetPublicProjectStatsQuery request, CancellationToken cancellationToken)
    {
        var projects = await unitOfWork.ProcurementProjectRepository.Query()
            .Include(p => p.BiddingDocument)
            .Include(p => p.ProcurementMode)
            .Include(p => p.ConsolidatedPR)
            .Where(p => !p.IsDeleted && (
                (p.BiddingDocument != null && p.BiddingDocument.Status == "Posted")
                || p.Status == "Posted"
                || p.Status == "ROUTED_TO_PORTAL"
                || p.Status == "Active"
                || p.Status == "Published"
                || p.Status == "Open"
                || p.Status == "ClosingSoon"
                || p.Status == "Closed"))
            .ToListAsync(cancellationToken);

        var isClosed = (string status) => status?.Equals("Closed", StringComparison.OrdinalIgnoreCase) ?? false;
        var isClosingSoon = (string status) => status?.Equals("ClosingSoon", StringComparison.OrdinalIgnoreCase) ?? false;

        var activeProjects = projects.Where(p => !isClosed(p.Status)).ToList();

        var svpCount = activeProjects.Count(p => GetPublicProjectsQueryHandler.IsSvp(p.ProcurementMode?.Name, p.ContractNo));
        var publicBiddingCount = activeProjects.Count(p => GetPublicProjectsQueryHandler.IsPublicBidding(p.ProcurementMode?.Name, p.ContractNo));

        // Include Approved RFQs (posted to public portal under Alternative Methods)
        var approvedRfqs = await unitOfWork.RFQRepository.Query()
            .Include(r => r.ModeOfProcurement)
            .Where(r => !r.IsDeleted && r.Status == StatusEnum.Approved)
            .ToListAsync(cancellationToken);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var isRfqClosed = (RFQ r) => r.Deadline.HasValue && r.Deadline.Value < today;
        var isRfqClosingSoon = (RFQ r) => r.Deadline.HasValue && !isRfqClosed(r) && r.Deadline.Value <= today.AddDays(3);

        var activeRfqs = approvedRfqs.Where(r => !isRfqClosed(r)).ToList();

        var svpRfqCount = activeRfqs.Count(r => GetPublicProjectsQueryHandler.IsSvp(r.ModeOfProcurement?.Name, r.RFQNumber));
        var closingSoonRfqCount = approvedRfqs.Count(isRfqClosingSoon);
        var closedRfqCount = approvedRfqs.Count(isRfqClosed);

        return ApiResponse<PublicProjectStatsDto>.Success(new PublicProjectStatsDto
        {
            ActiveProjects        = activeProjects.Count + activeRfqs.Count,
            PublicBidding         = publicBiddingCount,
            SmallValueProcurement = svpCount + svpRfqCount,
            ClosingSoon           = projects.Count(p => isClosingSoon(p.Status)) + closingSoonRfqCount,
            Closed                = projects.Count(p => isClosed(p.Status)) + closedRfqCount
        });
    }
}