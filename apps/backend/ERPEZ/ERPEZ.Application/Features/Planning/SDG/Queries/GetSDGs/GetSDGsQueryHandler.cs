using ERPEZ.Application.Features.Planning.SDG.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.SDG.Queries.GetSDGs;

public class GetSDGsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetSDGsQuery, PaginatedApiResponse<SDGResponse>>
{
    public async Task<PaginatedApiResponse<SDGResponse>> Handle(GetSDGsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.SDG, SDGResponse>> projection = sdg => new SDGResponse
        {
            Id = sdg.Id,
            Name = sdg.Name,
            Description = sdg.Description,
            SdgCode = sdg.SdgCode,
        };

        var (sdgs, totalCount) = await unitOfWork.SDGRepository.GetAllAsync(sieveModel, projection, cancellationToken);

        return new PaginatedApiResponse<SDGResponse>([.. sdgs], query.PageNumber, query.PageSize, totalCount);
    }
}
