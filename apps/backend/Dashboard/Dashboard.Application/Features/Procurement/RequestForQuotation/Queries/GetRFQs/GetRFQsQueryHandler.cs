using ERPEZ.Shared.Common;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;
using ERPEZ.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Queries.GetRFQs;

public class GetRFQsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetRFQsQuery, PaginatedApiResponse<RFQListItemDto>>
{
    public async Task<PaginatedApiResponse<RFQListItemDto>> Handle(GetRFQsQuery request, CancellationToken cancellationToken)
    {
        var page = request.PageNumber > 0 ? request.PageNumber : 1;
        var pageSize = request.PageSize > 0 ? request.PageSize : 10;

        var sieveModel = new SieveModel
        {
            Page = page,
            PageSize = pageSize,
            Filters = request.Filters,
            Sorts = request.Sorts
        };

        var (entities, totalCount) = await unitOfWork.RFQRepository.GetAllWithDetailsAsync(sieveModel, cancellationToken);

        var rfqIds = entities.Select(r => r.Id).ToList();
        var bidCounts = await unitOfWork.SupplierBidRepository.Query()
            .Where(b => rfqIds.Contains(b.RFQId) && !b.IsDeleted)
            .GroupBy(b => b.RFQId)
            .Select(g => new { RFQId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.RFQId, g => g.Count, cancellationToken);

        var items = entities.Select(r => new RFQListItemDto
        {
            Id = r.Id,
            RFQNumber = r.RFQNumber,
            Description = r.Description,
            TracingNumber = r.TracingNumber,
            ModeOfProcurementName = r.ModeOfProcurement?.Name,
            Deadline = r.Deadline,
            DeliveryPeriod = r.DeliveryPeriod,
            Status = r.Status,
            TotalAmount = r.TotalAmount,
            ApplicantCount = bidCounts.GetValueOrDefault(r.Id, 0)
        }).ToList();

        return new PaginatedApiResponse<RFQListItemDto>(items, page, pageSize, totalCount);
    }
}
