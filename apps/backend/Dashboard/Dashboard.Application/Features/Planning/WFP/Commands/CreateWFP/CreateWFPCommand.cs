using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFP.Commands.CreateWFP;

public class CreateWFPCommand : IRequest<ApiResponse<Guid>>
{
    public Guid OfficeId { get; set; }
    public string ProjectTitle { get; set; } = string.Empty;
    public string ProjectOwner { get; set; } = string.Empty;
    public Guid? OPCRId { get; set; }
    public Guid? FundSourceId { get; set; }
    public DateOnly ProjectStartDate { get; set; }
    public DateOnly ProjectEndDate { get; set; }
    public decimal? ProposedBudget { get; set; }
    public string? GeneralObjective { get; set; }
    public ModeEnum Mode { get; set; } = ModeEnum.External;
}
