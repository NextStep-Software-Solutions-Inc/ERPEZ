using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Commands.DeleteWFPObjectiveTarget;

public record class DeleteWFPObjectiveTargetCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
