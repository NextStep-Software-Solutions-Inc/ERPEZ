using ERPEZ.Application.Features.Planning.APP.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.APP.Queries.GetAPPs;

public record GetAPPsQuery(SieveModel SieveModel) : IRequest<PaginatedApiResponse<APPResponse>>;
