using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUFundAllocation.Queries.GetDUFundAllocations;

public class GetDUFundAllocationsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetDUFundAllocationsQuery, PaginatedApiResponse<Domain.Entities.Planning.DUFundAllocation>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.DUFundAllocation>> Handle(GetDUFundAllocationsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (duFundAllocations, totalCount) = await unitOfWork.DUFundAllocationRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<Domain.Entities.Planning.DUFundAllocation>(
            [.. duFundAllocations],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
