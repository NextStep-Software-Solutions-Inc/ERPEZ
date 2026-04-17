using ERPEZ.Application.Features.Planning.PPMPItemAllocation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.PPMPItemAllocation.Queries.GetPPMPItemAllocations;

public record GetPPMPItemAllocationsQuery(SieveModel SieveModel) : IRequest<PaginatedApiResponse<PPMPItemAllocationResponse>>;
