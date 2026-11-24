using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Commands.DeleteWFPObjectiveTimeline;

public record DeleteWFPObjectiveTimelineCommand(Guid Id) : IRequest<ApiResponse<bool>>;
