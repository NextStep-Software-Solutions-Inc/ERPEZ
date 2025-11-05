using ERPEZ.Application.Features.Planning.WFPActivity.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPActivity.Commands.CreateWFPActivity;

public class CreateWFPActivityCommand : IRequest<ApiResponse<WFPActivityDto>>
{
    public Guid WFPId { get; set; }
    public Guid WFPOutcomeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string OutputIndicator { get; set; } = string.Empty;
    public string Deliverable { get; set; } = string.Empty;
    public string Timeframe { get; set; } = string.Empty;
    public List<string>? PersonsInvolved { get; set; }
}
