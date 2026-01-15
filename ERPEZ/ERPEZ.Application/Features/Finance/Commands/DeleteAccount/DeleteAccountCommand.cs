using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Finance.Commands.DeleteAccount;

/// <summary>
/// Command to delete an account when balance is zero.
/// </summary>
public record DeleteAccountCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
