using ERPEZ.Application.Features.Planning.Cluster.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Cluster.Queries.GetClusters;

public class GetClustersQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetClustersQuery, PaginatedApiResponse<ClusterResponse>>
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

        var (clusters, totalCount) = await _unitOfWork.ClusterRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);

        var res = clusters.Select(clu => new ClusterResponse
        {
            Id = clu.Id,
            Name = clu.Name,
            Description = clu.Description,
            CreatedAt = clu.CreatedAt,
            CreatedBy = clu.CreatedBy
        }).ToList();

        return new PaginatedApiResponse<ClusterResponse>(
            [.. res],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}

