using ERPEZ.Application.Features.Planning.PPMP.Dtos;
using ERPEZ.Application.Features.Planning.PPMP.Queries.Common;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.PPMP.Queries.GetPPMPs;

public class GetPPMPsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetPPMPsQuery, PaginatedApiResponse<PPMPDetailedResponse>>
{
    public async Task<PaginatedApiResponse<PPMPDetailedResponse>> Handle(GetPPMPsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (entities, totalCount) = await unitOfWork.PPMPRepository.GetDetailedPagedAsync(sieveModel, cancellationToken);

        return new PaginatedApiResponse<PPMPDetailedResponse>(
            entities.Select(PPMPQueryProjection.BuildDetailedResponse).ToList(),
            totalCount,
            query.PageNumber,
            query.PageSize);
    }
}
