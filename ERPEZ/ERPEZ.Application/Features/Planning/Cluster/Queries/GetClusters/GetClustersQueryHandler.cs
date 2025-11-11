using ERPEZ.Application.Features.Planning.Cluster.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

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

        var (clusters, totalCount) = await unitOfWork.ClusterRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);

        var results = clusters.Select(c => new ClusterResponse
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description,
            CreatedAt = c.CreatedAt,
            CreatedBy = c.CreatedBy
        }).ToList();

        return new PaginatedApiResponse<ClusterResponse>(
            [.. results],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}

