using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Supplier.Commands.DeleteSupplier;

public record DeleteSupplierCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
