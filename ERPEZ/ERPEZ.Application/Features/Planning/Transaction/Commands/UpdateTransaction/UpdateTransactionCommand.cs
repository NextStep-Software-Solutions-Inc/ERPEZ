using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Transaction.Commands.UpdateTransaction;

public class UpdateTransactionCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public required UpdateTransactionRequest UpdateTransaction { get; set; }
}
