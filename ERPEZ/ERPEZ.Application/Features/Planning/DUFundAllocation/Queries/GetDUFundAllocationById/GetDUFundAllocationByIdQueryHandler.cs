using ERPEZ.Application.Features.Planning.DUFundAllocation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUFundAllocation.Queries.GetDUFundAllocationById;

public class GetDUFundAllocationByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetDUFundAllocationByIdQuery, ApiResponse<DUFundAllocationResponse>>
{
    public async Task<ApiResponse<DUFundAllocationResponse>> Handle(GetDUFundAllocationByIdQuery request, CancellationToken cancellationToken)
    {

        var duFundAllocationQuery = unitOfWork.DUFundAllocationRepository
            .Query(t => t.Id == request.Id)
            .Select(t => new DUFundAllocationResponse
            {
                Id = t.Id,
                DUAllocationId = t.DUAllocationId,
                Amount = t.Amount,
                ReceivedFund = new()
                {
                    Id = t.ReceivedFund.Id,
                    Amount = t.ReceivedFund.Amount,
                    Description = t.ReceivedFund.Description,
                    ReceivedDate = t.ReceivedFund.ReceivedDate,
                    FundSource = new()
                    {
                        Id = t.ReceivedFund.FundSource.Id,
                        Name = t.ReceivedFund.FundSource.Name,
                        Code = t.ReceivedFund.FundSource.Code,
                        Type = t.ReceivedFund.FundSource.Type.ToString(),
                        IsActive = t.ReceivedFund.FundSource.IsActive
                    }
                }
            });
            
        var duFundAllocation = await unitOfWork.DUFundAllocationRepository.GetFirstAsync(duFundAllocationQuery, cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<DUFundAllocationResponse>.Success(duFundAllocation, "Delivery Unit Fund Allocation retrieved successfully.");
    }
}
