using ERPEZ.Application.Features.Planning.WFPOutcome.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPOutcome.Commands.CreateWFPOutcome;

public class CreateWFPOutcomeCommand : IRequest<ApiResponse<WFPOutcomeResponse>>
{
    public Guid WFPObjectiveId { get; set; }
    public string Description { get; set; } = string.Empty;
}
