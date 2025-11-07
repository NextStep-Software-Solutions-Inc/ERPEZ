using ERPEZ.Application.Features.Planning.WFPObjective.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Commands.UpdateWFPObjective;

public class UpdateWFPObjectiveCommand : IRequest<ApiResponse<WFPObjectiveDto>>
{
    public Guid Id { get; set; }
    public required UpdateWFPObjectiveDto UpdateWFPObjective { get; set; }
}

