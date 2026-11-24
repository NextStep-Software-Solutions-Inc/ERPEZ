using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SDG.Commands.CreateSDG;

public record CreateSDGCommand : IRequest<ApiResponse<Guid>>
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public required string SdgCode {get; set; }
}
