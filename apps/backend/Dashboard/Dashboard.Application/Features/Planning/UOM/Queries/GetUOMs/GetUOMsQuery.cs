using ERPEZ.Application.Features.Planning.UOM.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.UOM.Queries.GetUOMs;

public record GetUOMsQuery(SieveModel SieveModel) : IRequest<PaginatedApiResponse<UOMResponse>>;
