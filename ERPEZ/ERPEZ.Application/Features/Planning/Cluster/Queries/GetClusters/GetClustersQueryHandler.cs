using ERPEZ.Application.Features.Planning.Cluster.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.Cluster.Queries.GetClusters;

public class GetClustersQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetClustersQuery, PaginatedApiResponse<ClusterResponse>>
{
    public async Task<PaginatedApiResponse<ClusterResponse>> Handle(GetClustersQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        Expression<Func<Domain.Entities.Planning.Cluster, ClusterResponse>> projection = c => new ClusterResponse
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description,
            CreatedAt = c.CreatedAt,
            CreatedBy = c.CreatedBy
        };
        var (clusters, totalCount) = await unitOfWork.ClusterRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);

        return new PaginatedApiResponse<ClusterResponse>(
            [.. clusters],
            query.PageNumber,
            query.PageSize,
            totalCount
            );
    }
}

