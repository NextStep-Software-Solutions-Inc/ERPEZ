using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OfficeType.Commands.CreateOfficeType;

public record CreateOfficeTypeCommand : IRequest<ApiResponse<Guid>>
{
    public required string Name { get; init; }
    public required string Code { get; init; }
    public bool CanHaveChildren { get; init; }
}
