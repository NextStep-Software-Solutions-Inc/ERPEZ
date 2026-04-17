using ERPEZ.Application.Features.Planning.PPMPItem.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.PPMPItem.Queries.GetPPMPItems;

public record GetPPMPItemsQuery(SieveModel SieveModel) : IRequest<PaginatedApiResponse<PPMPItemResponse>>;
