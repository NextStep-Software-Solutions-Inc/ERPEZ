using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SupplierCategory.Commands.DeleteSupplierCategory;

public record DeleteSupplierCategoryCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
