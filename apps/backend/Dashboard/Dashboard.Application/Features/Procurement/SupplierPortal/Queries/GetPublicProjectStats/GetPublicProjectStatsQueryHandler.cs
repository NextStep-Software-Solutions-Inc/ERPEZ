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
            .GetAllPublicProjectsWithModeAsync(cancellationToken);

        var isClosed = (string status) => status?.Equals("Closed", StringComparison.OrdinalIgnoreCase) ?? false;
        var isClosingSoon = (string status) => status?.Equals("ClosingSoon", StringComparison.OrdinalIgnoreCase) ?? false;

        var activeProjects = projects.Where(p => !isClosed(p.Status)).ToList();

        var isSvp = (string? mode, string? contractNo) =>
            (mode != null && (mode.Contains("Small Value", StringComparison.OrdinalIgnoreCase)
                           || mode.Contains("SVP", StringComparison.OrdinalIgnoreCase)
                           || mode.Contains("53.9", StringComparison.OrdinalIgnoreCase)))
            || (contractNo != null && (contractNo.StartsWith("SVP", StringComparison.OrdinalIgnoreCase) || contractNo.Contains("SVP", StringComparison.OrdinalIgnoreCase)));

        var isPublicBidding = (string? mode, string? contractNo) =>
            !isSvp(mode, contractNo) &&
            ((mode != null && (mode.Contains("Public Bidding", StringComparison.OrdinalIgnoreCase) 
                            || mode.Contains("Competitive Bidding", StringComparison.OrdinalIgnoreCase)
                            || mode.Contains("Bidding", StringComparison.OrdinalIgnoreCase)
                            || mode.Contains("Public", StringComparison.OrdinalIgnoreCase)))
             || (contractNo != null && (contractNo.StartsWith("ITB", StringComparison.OrdinalIgnoreCase) || contractNo.Contains("PB", StringComparison.OrdinalIgnoreCase))));

        var svpCount = activeProjects.Count(p => isSvp(p.ProcurementMode?.Name, p.ContractNo));
        var publicBiddingCount = activeProjects.Count(p => isPublicBidding(p.ProcurementMode?.Name, p.ContractNo));

        return ApiResponse<PublicProjectStatsDto>.Success(new PublicProjectStatsDto
        {
            ActiveProjects        = activeProjects.Count,
            PublicBidding         = publicBiddingCount,
            SmallValueProcurement = svpCount,
            ClosingSoon           = projects.Count(p => isClosingSoon(p.Status)),
            Closed                = projects.Count(p => isClosed(p.Status))
        });
    }
}