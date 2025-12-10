using ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Commands.UpdateWFPObjectiveTarget;

public class UpdateWFPObjectiveTargetCommand : IRequest<ApiResponse<WFPObjectiveTargetDto>>
{
    public Guid Id { get; set; }
    public required UpdateWFPObjectiveTargetDto UpdateWFPObjectiveTarget { get; set; }
}
