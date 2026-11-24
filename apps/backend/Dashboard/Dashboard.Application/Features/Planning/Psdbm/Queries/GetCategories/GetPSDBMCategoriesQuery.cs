using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Psdbm.Queries.GetCategories;

public record GetPsdbmCategoriesQuery : IRequest<ApiResponse<List<PsdbmCategoryDto>>>
{
    public required string Mode { get; init; }
}