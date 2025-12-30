using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Commands.UpdateWFPObjectiveTarget;

public class UpdateWFPObjectiveTargetCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public required UpdateWFPObjectiveTargetRequest UpdateWFPObjectiveTarget { get; set; }
}
