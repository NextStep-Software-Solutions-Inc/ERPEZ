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
            .FindAllAsync(p => p.BiddingDocument != null && p.BiddingDocument.Status == "Posted", cancellationToken);

        return ApiResponse<PublicProjectStatsDto>.Success(new PublicProjectStatsDto
        {
            ActiveProjects        = projects.Count,
            PublicBidding         = projects.Count(p => p.ProcurementMode != null && p.ProcurementMode.Name == "Public Bidding"),
            SmallValueProcurement = projects.Count(p => p.ProcurementMode != null && p.ProcurementMode.Name == "Small Value Procurement"),
            ClosingSoon           = projects.Count(p => p.Status == "ClosingSoon"),
            Closed                = projects.Count(p => p.Status == "Closed")
        });
    }
}