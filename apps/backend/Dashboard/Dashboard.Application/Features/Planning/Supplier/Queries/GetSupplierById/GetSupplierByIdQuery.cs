using ERPEZ.Application.Features.Planning.Supplier.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Supplier.Queries.GetSupplierById;

public record GetSupplierByIdQuery(Guid Id) : IRequest<ApiResponse<SupplierDetailedResponse>>;
