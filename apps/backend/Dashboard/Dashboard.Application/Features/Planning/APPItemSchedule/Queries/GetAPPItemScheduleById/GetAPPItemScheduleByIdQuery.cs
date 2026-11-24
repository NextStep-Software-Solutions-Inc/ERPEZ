using ERPEZ.Application.Features.Planning.APPItemSchedule.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APPItemSchedule.Queries.GetAPPItemScheduleById;

public record GetAPPItemScheduleByIdQuery(Guid Id) : IRequest<ApiResponse<APPItemScheduleResponse>>;
