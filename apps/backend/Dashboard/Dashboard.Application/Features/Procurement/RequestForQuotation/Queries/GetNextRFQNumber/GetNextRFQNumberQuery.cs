using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Queries.GetNextRFQNumber;

public record GetNextRFQNumberQuery(int? Year = null) : IRequest<ApiResponse<string>>;

public class GetNextRFQNumberQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetNextRFQNumberQuery, ApiResponse<string>>
{
    public async Task<ApiResponse<string>> Handle(GetNextRFQNumberQuery request, CancellationToken cancellationToken)
    {
        var targetYear = request.Year ?? DateTime.UtcNow.Year;
        var lastNumber = await unitOfWork.RFQRepository.GetLastRFQNumberAsync(targetYear, cancellationToken);

        int nextSeq = 1;
        if (!string.IsNullOrWhiteSpace(lastNumber))
        {
            var parts = lastNumber.Split('-');
            if (parts.Length >= 3 && int.TryParse(parts[^1], out var seq))
            {
                nextSeq = seq + 1;
            }
        }

        var nextRfqNumber = $"RFQ-{targetYear}-{nextSeq:D3}";
        return ApiResponse<string>.Success(nextRfqNumber);
    }
}
