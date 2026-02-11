using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UNSPSCCode.Commands.CreateUNSPSCCode;

public record CreateUNSPSCCodeCommand : IRequest<ApiResponse<Guid>>
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public int Level { get; init; }
    public Guid? ParentId { get; init; }
}
