using ERPEZ.Shared.Common;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;
using ERPEZ.Domain.Interfaces;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Queries.GetRFQs;

public class GetRFQsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetRFQsQuery, PaginatedApiResponse<RFQListItemDto>>
{
    public async Task<PaginatedApiResponse<RFQListItemDto>> Handle(GetRFQsQuery request, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            Page = request.PageNumber,
            PageSize = request.PageSize,
            Filters = request.Filters,
            Sorts = request.Sorts
        };

        var (entities, totalCount) = await unitOfWork.RFQRepository.GetAllWithDetailsAsync(sieveModel, cancellationToken);

        var items = entities.Select(r => new RFQListItemDto
        {
            Id = r.Id,
            RFQNumber = r.RFQNumber,
            Description = r.Description,
            TracingNumber = r.TracingNumber,
            ModeOfProcurementName = r.ModeOfProcurement?.Name,
            Deadline = r.Deadline,
            DeliveryPeriod = r.DeliveryPeriod,
            Status = r.Status
        }).ToList();

        return new PaginatedApiResponse<RFQListItemDto>(items, request.PageNumber, request.PageSize, totalCount);
    }
}
