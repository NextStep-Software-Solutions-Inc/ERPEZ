using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Location.Commands.CreateLocation;

public class CreateLocationCommand : IRequest<ApiResponse<Domain.Entities.Planning.Location>>
{
    public Guid? ParentId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public bool IsActive { get; init; }
}
