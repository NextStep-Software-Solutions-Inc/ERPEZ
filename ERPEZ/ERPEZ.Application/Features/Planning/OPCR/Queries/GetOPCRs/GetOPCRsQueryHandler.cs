using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCR.Queries.GetOPCRs;

public class GetOPCRsQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetOPCRsQuery, PaginatedApiResponse<Domain.Entities.Planning.OPCR>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.OPCR>> Handle(GetOPCRsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (opcrs, totalCount) = await _unitOfWork.OPCRRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<Domain.Entities.Planning.OPCR>(
            [.. opcrs],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}