using ERPEZ.Application.Features.Planning.ReceivedFund.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ReceivedFund.Queries.GetReceivedFundById;

public class GetReceivedFundByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetReceivedFundByIdQuery, ApiResponse<ReceivedFundResponse>>
{
    public async Task<ApiResponse<ReceivedFundResponse>> Handle(GetReceivedFundByIdQuery request, CancellationToken cancellationToken)
    {
        var receivedFundQuery = unitOfWork.ReceivedFundRepository
            .Query( t => t.Id == request.Id)
            .Select(rf => new ReceivedFundResponse
            {
                Id = rf.Id,
                FundSource = new FundSourceResponse
                {
                    Id = rf.FundSource.Id,
                    Name = rf.FundSource.Name,
                    Code = rf.FundSource.Code,
                    Type = rf.FundSource.Type.ToString(),
                    IsActive = rf.FundSource.IsActive,
                },
                Amount = rf.Amount,
                ReceivedDate = rf.ReceivedDate,
                Description = rf.Description,
            });
            
        var receivedFund = await unitOfWork.ReceivedFundRepository.GetFirstAsync(receivedFundQuery, cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<ReceivedFundResponse>.Success(receivedFund, "Retrieved successfully");
    }
}
