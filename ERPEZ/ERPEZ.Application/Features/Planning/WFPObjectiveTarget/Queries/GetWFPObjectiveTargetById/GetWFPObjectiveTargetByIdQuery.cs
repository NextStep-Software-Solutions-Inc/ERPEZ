using ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Queries.GetWFPObjectiveTargetById;

public record GetWFPObjectiveTargetByIdQuery(Guid Id) : IRequest<ApiResponse<WFPObjectiveTargetFullResponse>>;
