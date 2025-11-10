using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Cluster.Queries.GetClusters;

public class GetClustersQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetClustersQuery, PaginatedApiResponse<Domain.Entities.Planning.Cluster>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.Cluster>> Handle(GetClustersQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (clusters, totalCount) = await _unitOfWork.ClusterRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<Domain.Entities.Planning.Cluster>(
            [.. clusters],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}

