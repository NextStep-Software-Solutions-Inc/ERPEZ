using ERPEZ.Application.Features.Planning.APPItem.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.APPItem.Queries.GetAPPItems;

public record GetAPPItemsQuery(SieveModel SieveModel) : IRequest<PaginatedApiResponse<APPItemResponse>>;
