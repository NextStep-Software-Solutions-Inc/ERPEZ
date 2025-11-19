using ERPEZ.Application.Features.Planning.WFPObjective.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Commands.CreateWFPObjective;

public class CreateWFPObjectiveCommand : IRequest<ApiResponse<WFPObjectiveDto>>
{
    public Guid WFPId { get; set; }
    public string Description { get; set; } = string.Empty;
}
