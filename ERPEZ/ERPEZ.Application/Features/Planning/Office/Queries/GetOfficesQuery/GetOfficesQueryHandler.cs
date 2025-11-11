using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Office.Queries.GetOfficesQuery;

public class GetOfficesQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOfficesQuery, PaginatedApiResponse<Domain.Entities.Planning.Office>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.Office>> Handle(GetOfficesQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (offices, totalCount) = await unitOfWork.OfficeRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<Domain.Entities.Planning.Office>(
            [.. offices],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
