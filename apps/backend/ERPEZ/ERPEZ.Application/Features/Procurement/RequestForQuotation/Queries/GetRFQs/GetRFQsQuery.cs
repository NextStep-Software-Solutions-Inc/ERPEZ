using ERPEZ.Shared.Common;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;
using ERPEZ.Domain.Interfaces;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Queries.GetRFQs;

public record GetRFQsQuery(
    int PageNumber,
    int PageSize,
    string? Filters,
    string? Sorts
) : IRequest<PaginatedApiResponse<RFQListItemDto>>;
