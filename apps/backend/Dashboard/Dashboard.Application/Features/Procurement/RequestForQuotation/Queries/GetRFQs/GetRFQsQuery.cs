using ERPEZ.Shared.Common;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;
using ERPEZ.Domain.Interfaces;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Queries.GetRFQs;

public record GetRFQsQuery(
    int PageNumber = 1,
    int PageSize = 10,
    string? Filters = null,
    string? Sorts = null
) : IRequest<PaginatedApiResponse<RFQListItemDto>>;
