using ERPEZ.Application.Features.Planning.WFPObjective.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Commands.CreateWFPObjective;

public class CreateWFPObjectiveCommand : IRequest<ApiResponse<WFPObjectiveResponse>>
{
    public Guid WFPId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Weight { get; set; }
    public string? Outcome { get; set; }
}
