using ERPEZ.Shared.Common;
using ERPEZ.Application.RFQ.DTOs;
using ERPEZ.Domain.Interfaces;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.RFQ.Queries.GetRFQs;

public record GetRFQsQuery(
    int PageNumber,
    int PageSize,
    string? Filters,
    string? Sorts
) : IRequest<PaginatedApiResponse<RFQListItemDto>>;
