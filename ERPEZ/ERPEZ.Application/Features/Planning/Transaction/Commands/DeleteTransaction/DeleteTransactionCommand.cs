using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Transaction.Commands.DeleteTransaction;

public record class DeleteTransactionCommand(Guid Id) : IRequest<ApiResponse<Unit>>;