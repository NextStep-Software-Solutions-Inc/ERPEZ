using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Queries.GetWFPObjectiveById;

public record class GetWFPObjectiveByIdQuery(Guid Id) : IRequest<ApiResponse<Domain.Entities.Planning.WFPObjective>>;
