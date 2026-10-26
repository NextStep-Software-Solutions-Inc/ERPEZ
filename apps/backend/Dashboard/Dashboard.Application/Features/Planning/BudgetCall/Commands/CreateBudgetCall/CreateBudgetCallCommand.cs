using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.BudgetCall.Commands.CreateBudgetCall;

public record CreateBudgetCallCommand : IRequest<ApiResponse<Guid>>
{
    public Guid FiscalYearId { get; init; }
    public string? Type { get; init; }
    public DateTime SubmissionDeadline { get; init; }
    public string? Status { get; init; }
}
