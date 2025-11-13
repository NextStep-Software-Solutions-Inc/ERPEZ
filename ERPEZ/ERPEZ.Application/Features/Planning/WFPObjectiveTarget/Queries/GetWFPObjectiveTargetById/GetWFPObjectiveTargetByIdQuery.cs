using ERPEZ.Application.Features.Planning.Cluster.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Queries.GetWFPObjectiveTargetById;

public record class GetWFPObjectiveTargetByIdQuery(Guid Id) : IRequest<ApiResponse<WFPObjectiveTargetResponse>>;
