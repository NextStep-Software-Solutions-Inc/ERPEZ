using ERPEZ.Application.Features.Planning.Category.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Category.Commands.UpdateCategory;

public record UpdateCategoryCommand : IRequest<ApiResponse<Unit>>
{
    public required Guid Id { get; init; }
    public required UpdateCategoryRequest UpdateCategory { get; init; }
}
