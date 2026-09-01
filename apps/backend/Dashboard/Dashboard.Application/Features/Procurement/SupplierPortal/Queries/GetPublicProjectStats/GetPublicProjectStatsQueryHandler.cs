using ERPEZ.Application.Features.Procurement.SupplierPortal.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetPublicProjectStats;

public class GetPublicProjectStatsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPublicProjectStatsQuery, ApiResponse<PublicProjectStatsDto>>
{
    public async Task<ApiResponse<PublicProjectStatsDto>> Handle(
        GetPublicProjectStatsQuery request, CancellationToken cancellationToken)
    {
        var projects = await unitOfWork.ProcurementProjectRepository
            .FindAllAsync(p => (p.BiddingDocument != null && p.BiddingDocument.Status == "Posted") 
                            || p.Status == "ROUTED_TO_PORTAL" 
                            || p.Status == "Active" 
                            || p.Status == "Published" 
                            || p.Status == "Open"
                            || p.Status == "ClosingSoon"
                            || p.Status == "Closed", cancellationToken);

        var isClosed = (string status) => status?.Equals("Closed", StringComparison.OrdinalIgnoreCase) ?? false;
        var isClosingSoon = (string status) => status?.Equals("ClosingSoon", StringComparison.OrdinalIgnoreCase) ?? false;

        var activeProjects = projects.Where(p => !isClosed(p.Status)).ToList();

        var isPublicBidding = (string? mode) => mode != null && (mode.Contains("Public Bidding", StringComparison.OrdinalIgnoreCase) || mode.Contains("Public", StringComparison.OrdinalIgnoreCase));
        var isSvp = (string? mode) => mode != null && (mode.Contains("Small Value", StringComparison.OrdinalIgnoreCase) || mode.Contains("SVP", StringComparison.OrdinalIgnoreCase));

        return ApiResponse<PublicProjectStatsDto>.Success(new PublicProjectStatsDto
        {
            ActiveProjects        = activeProjects.Count,
            PublicBidding         = activeProjects.Count(p => isPublicBidding(p.ProcurementMode?.Name)),
            SmallValueProcurement = activeProjects.Count(p => isSvp(p.ProcurementMode?.Name)),
            ClosingSoon           = projects.Count(p => isClosingSoon(p.Status)),
            Closed                = projects.Count(p => isClosed(p.Status))
        });
    }
}