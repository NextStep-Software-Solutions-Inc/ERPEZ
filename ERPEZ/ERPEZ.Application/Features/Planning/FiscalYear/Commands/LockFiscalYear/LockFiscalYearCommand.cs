using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.LockFiscalYear;

public class LockFiscalYearCommand : IRequest<ApiResponse<string>>
{
    public Guid Id { get; }
    public LockFiscalYearCommand(Guid id) => Id = id;
}
