using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.UpdateFiscalYear;

public record UpdateFiscalYearCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public int? Year { get; init; }
    public string? Description { get; init; }
}
