using ERPEZ.Application.Features.Planning.Category.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Category.Queries.GetCategoryById;

public record GetCategoryByIdQuery(Guid Id) : IRequest<ApiResponse<CategoryResponse>>;
