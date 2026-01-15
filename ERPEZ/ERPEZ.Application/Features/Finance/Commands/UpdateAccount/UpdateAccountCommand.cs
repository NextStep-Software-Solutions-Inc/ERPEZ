using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Finance.Commands.UpdateAccount;

/// <summary>
/// Command to update an account's name.
/// </summary>
public record UpdateAccountCommand(Guid Id, string Name) : IRequest<ApiResponse<Unit>>;
