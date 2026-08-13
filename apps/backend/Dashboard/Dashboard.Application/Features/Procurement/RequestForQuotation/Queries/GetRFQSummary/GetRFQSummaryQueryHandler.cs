using ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Queries.GetRFQSummary;

public class GetRFQSummaryQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetRFQSummaryQuery, ApiResponse<RFQSummaryDto>>
{
    public async Task<ApiResponse<RFQSummaryDto>> Handle(GetRFQSummaryQuery request, CancellationToken cancellationToken)
    {
        var (total, draft, submitted, approved, returned) =
            await unitOfWork.RFQRepository.GetSummaryAsync(cancellationToken);

        return ApiResponse<RFQSummaryDto>.Success(new RFQSummaryDto
        {
            Total = total,
            Draft = draft,
            Submitted = submitted,
            Approved = approved,
            Returned = returned
        });
    }
}
