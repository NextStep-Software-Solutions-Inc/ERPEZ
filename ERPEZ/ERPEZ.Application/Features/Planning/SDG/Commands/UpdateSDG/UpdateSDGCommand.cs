using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SDG.Commands.UpdateSDG;

public record UpdateSDGCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id {get; init; }
    public string? Name { get; init; }
    public string? Description { get; init; }
    public string? SdgCode {get; init; }
}
