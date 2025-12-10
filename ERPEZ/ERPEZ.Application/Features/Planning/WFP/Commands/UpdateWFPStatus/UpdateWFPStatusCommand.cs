using ERPEZ.Application.Features.Planning.WFP.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFP.Commands.UpdateWFPStatus;

public class UpdateWFPStatusCommand : IRequest<ApiResponse<WFPResponse>>
{
    public Guid Id { get; set; }
    public string Status { get; set; } = string.Empty;
}
