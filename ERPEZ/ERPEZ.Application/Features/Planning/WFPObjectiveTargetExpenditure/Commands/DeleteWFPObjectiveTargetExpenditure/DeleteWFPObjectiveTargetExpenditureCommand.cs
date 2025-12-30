using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Commands.DeleteWFPObjectiveTargetExpenditure;

public record DeleteWFPObjectiveTargetExpenditureCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
