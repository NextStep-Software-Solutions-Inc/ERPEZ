using ERPEZ.Application.Features.Planning.SupplierCategory.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.SupplierCategory.Queries.GetSupplierCategories;

public record GetSupplierCategoriesQuery(SieveModel SieveModel) : IRequest<PaginatedApiResponse<SupplierCategoryResponse>>;
