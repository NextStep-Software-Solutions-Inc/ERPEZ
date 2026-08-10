using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Queries.GetWFPObjectiveTimelineById;

public record GetWFPObjectiveTimelineByIdQuery(Guid Id) : IRequest<ApiResponse<WFPObjectiveTimelineResponse>>;
