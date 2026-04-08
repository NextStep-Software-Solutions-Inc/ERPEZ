using ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Commands.UpdateWFPObjectiveActivity;

public class UpdateWFPObjectiveActivityCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public required UpdateWFPObjectiveActivityRequest UpdateWFPObjectiveActivity { get; set; }
}
