using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ReceivedFund.Queries.GetReceivedFundById;

public class GetReceivedFundByIdQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetReceivedFundByIdQuery, ApiResponse<Domain.Entities.Planning.ReceivedFund>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.ReceivedFund>> Handle(GetReceivedFundByIdQuery request, CancellationToken cancellationToken)
    {
        var receivedFund = await _unitOfWork.ReceivedFundRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.ReceivedFund>.Success(receivedFund, "Retrieved successfully");
    }
}
