using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Queries.GetFYActiveKPIs;

public record GetFYActiveKPIsQuery(SieveModel SieveModel) : IRequest<PaginatedApiResponse<FYActiveKPIResponse>>;
