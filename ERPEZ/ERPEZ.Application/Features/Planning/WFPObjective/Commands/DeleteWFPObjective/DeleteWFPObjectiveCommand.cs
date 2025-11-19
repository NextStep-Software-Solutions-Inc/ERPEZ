using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Commands.DeleteWFPObjective;

public record class DeleteWFPObjectiveCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
