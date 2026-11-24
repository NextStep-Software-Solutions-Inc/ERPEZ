using ERPEZ.Application.Features.Planning.WFPObjective.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Queries.GetWFPObjectiveById;

public record GetWFPObjectiveByIdQuery(Guid Id) : IRequest<ApiResponse<WFPObjectiveDetailedResponse>>;
