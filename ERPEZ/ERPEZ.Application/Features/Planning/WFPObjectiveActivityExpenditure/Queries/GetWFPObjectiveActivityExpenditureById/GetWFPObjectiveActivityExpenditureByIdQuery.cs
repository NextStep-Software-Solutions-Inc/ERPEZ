using ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Queries.GetWFPObjectiveActivityExpenditureById;

public record GetWFPObjectiveActivityExpenditureByIdQuery(Guid Id) : IRequest<ApiResponse<WFPObjectiveActivityExpenditureResponse>>;
