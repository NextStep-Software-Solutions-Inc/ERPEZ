using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Commands.DeleteWFPObjectiveTimeline;

public record class DeleteWFPObjectiveTimelineCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
