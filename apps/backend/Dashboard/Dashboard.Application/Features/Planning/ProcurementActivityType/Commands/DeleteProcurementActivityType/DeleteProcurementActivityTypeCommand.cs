using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementActivityType.Commands.DeleteProcurementActivityType;

public record DeleteProcurementActivityTypeCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
