using ERPEZ.Application.Features.Planning.WFPActivity.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPActivity.Commands.UpdateWFPActivity;

public class UpdateWFPActivityCommand : IRequest<ApiResponse<Domain.Entities.Planning.WFPActivity>>
{
    public Guid Id { get; set; }
    public required UpdateWFPActivityDto UpdateWFPActivity { get; set; }
}


