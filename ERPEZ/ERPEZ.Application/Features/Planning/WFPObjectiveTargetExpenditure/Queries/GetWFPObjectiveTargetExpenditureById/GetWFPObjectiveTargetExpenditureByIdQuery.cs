using ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Queries.GetWFPObjectiveTargetExpenditureById;

public record GetWFPObjectiveTargetExpenditureByIdQuery(Guid Id) : IRequest<ApiResponse<WFPObjectiveTargetExpenditureResponse>>;
