using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Finance.Commands.CreateAccountTransaction;

/// <summary>
/// Command to create a new account transaction in Draft status.
/// Business logic execution happens during authorization.
/// Transaction code is auto-generated based on timestamp and series number.
/// Either ToAccountId or OfficeId must be provided.
/// </summary>
public record CreateAccountTransactionCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid FromAccountId { get; init; }
    public Guid? ToAccountId { get; init; }
    public Guid? OfficeId { get; init; }
    public required string Purpose { get; init; }
    public required decimal AmountTransfer { get; init; }
    public required DateTime TransactionDate { get; init; }
}
