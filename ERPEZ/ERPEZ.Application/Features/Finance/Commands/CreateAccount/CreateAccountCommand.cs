using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Finance.Commands.CreateAccount;

/// <summary>
/// Command to create a new financial account for an office and fiscal year.
/// </summary>
public record CreateAccountCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid OfficeId { get; init; }
    public Guid? FundSourceId { get; init; }
    public required Guid FiscalYearId { get; init; }
    public string? Name { get; init; }
}
