using ERPEZ.Application.Features.Planning.APPItemSchedule.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.APPItemSchedule.Queries.GetAPPItemSchedules;

public record GetAPPItemSchedulesQuery(SieveModel SieveModel) : IRequest<PaginatedApiResponse<APPItemScheduleResponse>>;
