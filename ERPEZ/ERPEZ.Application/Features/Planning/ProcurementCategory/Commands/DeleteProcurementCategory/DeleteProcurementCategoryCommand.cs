using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementCategory.Commands.DeleteProcurementCategory;

public record DeleteProcurementCategoryCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
