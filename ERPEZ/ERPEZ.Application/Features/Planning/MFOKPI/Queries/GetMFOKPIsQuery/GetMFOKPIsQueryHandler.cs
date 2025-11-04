using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MFOKPI.Queries.GetMFOKPIsQuery;

public class GetMFOKPIsQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetMFOKPIsQuery, PaginatedApiResponse<Domain.Entities.Planning.MFOKPI>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.MFOKPI>> Handle(GetMFOKPIsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (mfokpis, totalCount) = await _unitOfWork.MFOKPIRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<Domain.Entities.Planning.MFOKPI>(
            [.. mfokpis],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
