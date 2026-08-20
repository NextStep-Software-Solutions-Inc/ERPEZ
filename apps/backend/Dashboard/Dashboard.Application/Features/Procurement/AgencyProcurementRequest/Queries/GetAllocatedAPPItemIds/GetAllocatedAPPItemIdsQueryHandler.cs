using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Queries.GetAllocatedAPPItemIds;

public class GetAllocatedAPPItemIdsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetAllocatedAPPItemIdsQuery, ApiResponse<List<Guid>>>
{
    public async Task<ApiResponse<List<Guid>>> Handle(
        GetAllocatedAPPItemIdsQuery request, CancellationToken cancellationToken)
    {
        var allocatedIds = await unitOfWork.APRItemRepository.GetAllocatedAPPItemIdsAsync(
            request.ExcludeAprId, cancellationToken);

        return ApiResponse<List<Guid>>.Success(allocatedIds, "Allocated APP item IDs retrieved successfully.");
    }
}
