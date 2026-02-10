using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Category.Commands.DeleteCategory;

public record DeleteCategoryCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
