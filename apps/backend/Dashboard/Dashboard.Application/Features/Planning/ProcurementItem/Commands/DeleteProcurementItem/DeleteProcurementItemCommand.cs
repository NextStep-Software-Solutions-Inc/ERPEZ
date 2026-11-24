using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementItem.Commands.DeleteProcurementItem;

public record DeleteProcurementItemCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
