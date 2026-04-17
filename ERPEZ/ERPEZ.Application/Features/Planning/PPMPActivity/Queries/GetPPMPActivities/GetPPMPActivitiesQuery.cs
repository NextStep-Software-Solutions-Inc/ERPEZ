using ERPEZ.Application.Features.Planning.PPMPActivity.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.PPMPActivity.Queries.GetPPMPActivities;

public record GetPPMPActivitiesQuery(SieveModel SieveModel) : IRequest<PaginatedApiResponse<PPMPActivityResponse>>;
