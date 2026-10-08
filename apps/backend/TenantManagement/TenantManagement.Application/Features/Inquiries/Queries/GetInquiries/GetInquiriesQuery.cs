using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.Inquiries.Common;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Inquiries.Queries.GetInquiries;

public record GetInquiriesQuery : IRequest<ApiResponse<InquiriesSummaryDto>>;

public class GetInquiriesQueryHandler(IInquiryStore inquiryStore)
    : IRequestHandler<GetInquiriesQuery, ApiResponse<InquiriesSummaryDto>>
{
    public Task<ApiResponse<InquiriesSummaryDto>> Handle(GetInquiriesQuery request, CancellationToken cancellationToken)
    {
        var summary = inquiryStore.GetSummary();
        return Task.FromResult(ApiResponse<InquiriesSummaryDto>.Success(summary, "Inquiries retrieved successfully."));
    }
}
