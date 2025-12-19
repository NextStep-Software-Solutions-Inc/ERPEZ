using System.Linq.Expressions;
using ERPEZ.Application.Features.Planning.DUFundAllocation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUFundAllocation.Queries.GetDUFundAllocations;

public class GetDUFundAllocationsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetDUFundAllocationsQuery, PaginatedApiResponse<DUFundAllocationsResponse>>
{
    public async Task<PaginatedApiResponse<DUFundAllocationsResponse>> Handle(GetDUFundAllocationsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        // calculate UtilizedAmount for each ReceivedFund
        var utilizationQuery = unitOfWork.DUFundAllocationRepository
            .Query()
            .GroupBy(d => d.ReceivedFundId)
            .Select(g => new
            {
                ReceivedFundId = g.Key,
                UtilizedAmount = g.Sum(d => d.Amount)
            });


        Expression<Func<Domain.Entities.Planning.DUFundAllocation, DUFundAllocationsResponse>> projection = duFundAllocation => new DUFundAllocationsResponse
        {
            Id = duFundAllocation.Id,
            DUAllocationId = duFundAllocation.DUAllocationId,
            Amount = duFundAllocation.Amount,
            ReceivedFund = new ()
            {
                Id = duFundAllocation.ReceivedFund.Id,
                Amount = duFundAllocation.ReceivedFund.Amount,
                UtilizedAmount = utilizationQuery
                    .Where(u => u.ReceivedFundId == duFundAllocation.ReceivedFund.Id)
                    .Select(u => u.UtilizedAmount)
                    .FirstOrDefault(),
                Description = duFundAllocation.ReceivedFund.Description,
                ReceivedDate = duFundAllocation.ReceivedFund.ReceivedDate,
                FundSource = new ()
                {
                    Id = duFundAllocation.ReceivedFund.FundSource.Id,
                    Name = duFundAllocation.ReceivedFund.FundSource.Name,
                    Code = duFundAllocation.ReceivedFund.FundSource.Code,
                    Type = duFundAllocation.ReceivedFund.FundSource.Type.ToString(),
                    IsActive = duFundAllocation.ReceivedFund.FundSource.IsActive
                }
            }
        };

        var (duFundAllocations, totalCount) = await unitOfWork.DUFundAllocationRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);
       
        return new PaginatedApiResponse<DUFundAllocationsResponse>(
            [.. duFundAllocations],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
