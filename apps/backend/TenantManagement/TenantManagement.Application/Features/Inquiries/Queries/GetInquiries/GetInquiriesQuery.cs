using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.Inquiries.Common;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ERPEZ.TenantManagement.Application.Features.Inquiries.Queries.GetInquiries;

public record GetInquiriesQuery(
    string? InquiryType = null,
    string? Status = null,
    string? Search = null)
    : IRequest<ApiResponse<InquiriesSummaryDto>>;

public class GetInquiriesQueryHandler(
    IInquiryStore inquiryStore,
    ILogger<GetInquiriesQueryHandler> logger)
    : IRequestHandler<GetInquiriesQuery, ApiResponse<InquiriesSummaryDto>>
{
    public async Task<ApiResponse<InquiriesSummaryDto>> Handle(GetInquiriesQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var summary = await inquiryStore.GetSummaryAsync(
                request.InquiryType,
                request.Status,
                request.Search,
                cancellationToken);

            return ApiResponse<InquiriesSummaryDto>.Success(summary, "Inquiries retrieved successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to retrieve inquiries summary");
            return ApiResponse<InquiriesSummaryDto>.Fail("Unable to retrieve inquiries at this time.");
        }
    }
}
