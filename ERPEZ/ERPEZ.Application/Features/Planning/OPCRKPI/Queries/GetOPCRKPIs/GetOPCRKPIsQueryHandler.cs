using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRKPI.Queries.GetOPCRKPIs;

public class GetOPCRKPIsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOPCRKPIsQuery, PaginatedApiResponse<Domain.Entities.Planning.OPCRKPI>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.OPCRKPI>> Handle(GetOPCRKPIsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (opcrKpis, totalCount) = await unitOfWork.OPCRKPIRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<Domain.Entities.Planning.OPCRKPI>(
            [.. opcrKpis],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
