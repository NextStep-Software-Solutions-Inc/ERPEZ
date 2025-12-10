using ERPEZ.Application.Features.Planning.WFPOutcome.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPOutcome.Commands.UpdateWFPOutcome;

public class UpdateWFPOutcomeCommand : IRequest<ApiResponse<WFPOutcomeResponse>>
{
    public Guid Id { get; set; }
    public required UpdateWFPOutcomeRequest UpdateWFPOutcome { get; set; }
}

