using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Commands.DeleteWFPObjectiveTarget;

public record DeleteWFPObjectiveTargetCommand(Guid Id) : IRequest<ApiResponse<bool>>;
