using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.APP.Commands.ChangeAPPStatus;

public class ChangeAPPStatusRequest
{
    public required StatusEnum Status { get; init; }
    public string? Remarks { get; init; }
}