using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Commands.DeleteWFPObjectiveActivity;

public record DeleteWFPObjectiveActivityCommand(Guid Id) : IRequest<ApiResponse<bool>>;
