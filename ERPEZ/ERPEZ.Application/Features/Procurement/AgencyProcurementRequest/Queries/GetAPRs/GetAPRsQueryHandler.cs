using System.Linq.Expressions;
using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Dtos;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Queries.GetAPRs;

public class GetAPRsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetAPRsQuery, PaginatedApiResponse<APRListItemDto>>
{
    public async Task<PaginatedApiResponse<APRListItemDto>> Handle(
        GetAPRsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            Page     = query.PageNumber,
            PageSize = query.PageSize,
            Filters  = query.Filters,
            Sorts    = query.Sorts
        };

        Expression<Func<APR, APRListItemDto>> projection = a => new APRListItemDto
        {
            Id          = a.Id,
            APRNumber   = a.APRNumber,
            ItemCount   = a.APRItems.Count(i => !i.IsDeleted),
            TotalAmount = a.TotalAmount,
            RequestDate = a.RequestDate,
            Status      = a.Status,
            OfficeName  = a.Office!.Name,
            FiscalYear  = a.FiscalYear!.Year
        };

        var (items, total) = await unitOfWork.APRRepository
            .GetAllAsync(sieveModel, projection, cancellationToken);

        return new PaginatedApiResponse<APRListItemDto>(
            [.. items], query.PageNumber, query.PageSize, total);
    }
}
