using ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Commands.CreateWFPObjectiveTarget;

public class CreateWFPObjectiveTargetCommand : IRequest<ApiResponse<WFPObjectiveTargetResponse>>
{
    public Guid WFPObjectiveId { get; set; }
    public string ActivityName { get; set; } = string.Empty;
    public string Indicator { get; set; } = string.Empty;
    public decimal Weight { get; set; }
}
