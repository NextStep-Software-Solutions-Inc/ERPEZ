using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Transaction.Commands.DeleteTransaction;

public record DeleteTransactionCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
