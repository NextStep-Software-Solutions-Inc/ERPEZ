using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetBidNoticeDownloadUrl;

public record GetBidNoticeDownloadUrlQuery(Guid ProjectId, Guid ChecklistItemId)
    : IRequest<ApiResponse<string>>;