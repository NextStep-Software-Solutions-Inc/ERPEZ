using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Commands.DeleteWFPObjectiveActivityExpenditure;

public record DeleteWFPObjectiveActivityExpenditureCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
