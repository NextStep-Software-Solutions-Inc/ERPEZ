using ERPEZ.Application.Features.Planning.UNSPSCCode.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.UNSPSCCode.Queries.GetUNSPSCCodes;

public record GetUNSPSCCodesQuery(SieveModel SieveModel) : IRequest<PaginatedApiResponse<UNSPSCCodeResponse>>;
