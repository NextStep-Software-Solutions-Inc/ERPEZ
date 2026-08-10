using ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Queries.GetWFPObjectiveActivityById;

public record GetWFPObjectiveActivityByIdQuery(Guid Id) : IRequest<ApiResponse<WFPObjectiveActivityDetailedResponse>>;
