using ERPEZ.Application.Features.Planning.Supplier.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.Supplier.Queries.GetSuppliers;

public record GetSuppliersQuery(SieveModel SieveModel) : IRequest<PaginatedApiResponse<SupplierResponse>>;
