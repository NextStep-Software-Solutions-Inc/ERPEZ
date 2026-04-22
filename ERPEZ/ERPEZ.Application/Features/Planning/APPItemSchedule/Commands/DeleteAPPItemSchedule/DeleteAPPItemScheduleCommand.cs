using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APPItemSchedule.Commands.DeleteAPPItemSchedule;

public record DeleteAPPItemScheduleCommand(Guid Id) : IRequest<ApiResponse<bool>>;
