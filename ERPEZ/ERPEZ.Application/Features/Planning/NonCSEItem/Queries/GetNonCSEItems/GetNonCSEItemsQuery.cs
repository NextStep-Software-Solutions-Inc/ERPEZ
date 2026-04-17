using ERPEZ.Application.Features.Planning.NonCSEItem.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.NonCSEItem.Queries.GetNonCSEItems;

public record GetNonCSEItemsQuery(SieveModel SieveModel) : IRequest<PaginatedApiResponse<NonCSEItemResponse>>;
