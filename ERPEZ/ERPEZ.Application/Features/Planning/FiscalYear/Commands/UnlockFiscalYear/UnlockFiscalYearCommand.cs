using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.UnlockFiscalYear;

public class UnlockFiscalYearCommand : IRequest<ApiResponse<string>>
{
    public Guid Id { get; }
    public UnlockFiscalYearCommand(Guid id) => Id = id;
}
