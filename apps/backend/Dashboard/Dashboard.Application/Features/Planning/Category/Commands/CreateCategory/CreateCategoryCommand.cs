using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Category.Commands.CreateCategory;

public record CreateCategoryCommand : IRequest<ApiResponse<Guid>>
{
    public required string Name { get; init; }
    public required string Code { get; init; }
    public bool CanHaveChildren { get; init; }
}
