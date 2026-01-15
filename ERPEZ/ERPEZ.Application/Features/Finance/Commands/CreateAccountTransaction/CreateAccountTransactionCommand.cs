using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Finance.Commands.CreateAccountTransaction;

/// <summary>
/// Command to create a new account transaction in Draft status.
/// Business logic execution happens during authorization.
/// </summary>
public record CreateAccountTransactionCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid FromAccountId { get; init; }
    public required Guid ToAccountId { get; init; }
    public required string Purpose { get; init; }
    public required decimal AmountTransfer { get; init; }
    public required int Code { get; init; }
    public required DateTime TransactionDate { get; init; }
}
