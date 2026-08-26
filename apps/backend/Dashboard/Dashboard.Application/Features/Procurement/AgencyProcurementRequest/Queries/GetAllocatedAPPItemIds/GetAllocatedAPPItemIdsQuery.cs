using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Queries.GetAllocatedAPPItemIds;

public record GetAllocatedAPPItemIdsQuery(Guid? ExcludeAprId = null) : IRequest<ApiResponse<List<Guid>>>;
