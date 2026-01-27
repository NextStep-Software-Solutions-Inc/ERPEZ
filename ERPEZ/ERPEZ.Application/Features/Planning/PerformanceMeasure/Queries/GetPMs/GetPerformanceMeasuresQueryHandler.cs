using ERPEZ.Application.Features.Planning.PerformanceMeasure.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.PerformanceMeasure.Queries.GetPMs;

public class GetPerformanceMeasuresQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetPerformanceMeasuresQuery, PaginatedApiResponse<PerformanceMeasureResponse>>
{
    public async Task<PaginatedApiResponse<PerformanceMeasureResponse>> Handle(GetPerformanceMeasuresQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.PerformanceMeasure, PerformanceMeasureResponse>> projection = pm => new PerformanceMeasureResponse
        {
            Id = pm.Id,
            Name = pm.Name,
            Description = pm.Description
        };

        var (pms, totalCount) = await unitOfWork.PerformanceMeasureRepository.GetAllAsync(sieveModel, projection, cancellationToken);
        return new PaginatedApiResponse<PerformanceMeasureResponse>(
            [.. pms],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
