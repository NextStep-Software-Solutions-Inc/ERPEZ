using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.Category.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.Category.Queries.GetCategories;

public record GetCategoriesQuery : PaginatedQuery<PaginatedApiResponse<CategoryResponse>>;
