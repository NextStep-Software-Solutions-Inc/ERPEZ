using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APP.Commands.ChangeAPPStatus;

public class ChangeAPPStatusCommand : IRequest<ApiResponse<Guid>>
{
    public Guid Id { get; set; }
    public required StatusEnum Status { get; set; }
    public string? Remarks { get; set; }
}