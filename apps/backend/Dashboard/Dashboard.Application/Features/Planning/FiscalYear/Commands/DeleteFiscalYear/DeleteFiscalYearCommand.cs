using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.DeleteFiscalYear;

public class DeleteFiscalYearCommand : IRequest<ApiResponse<string>>
{
    public Guid Id { get; }
    public DeleteFiscalYearCommand(Guid id) => Id = id;
}
