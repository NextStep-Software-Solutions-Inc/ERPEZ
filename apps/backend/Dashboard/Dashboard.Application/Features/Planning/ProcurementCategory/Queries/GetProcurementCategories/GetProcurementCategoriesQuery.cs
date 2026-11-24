using ERPEZ.Application.Features.Planning.ProcurementCategory.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.ProcurementCategory.Queries.GetProcurementCategories;

public record GetProcurementCategoriesQuery(SieveModel SieveModel) : IRequest<PaginatedApiResponse<ProcurementCategoryResponse>>;
