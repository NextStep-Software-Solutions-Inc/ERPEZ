using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Finance.Commands.AuthorizeAccountTransaction;

/// <summary>
/// Command to authorize a transaction with PIN and execute atomic balance transfer.
/// This triggers the actual fund transfer between accounts.
/// </summary>
public record AuthorizeAccountTransactionCommand : IRequest<ApiResponse<Unit>>
{
    public required Guid TransactionId { get; init; }
    public required string AuthorizationPIN { get; init; }
}
