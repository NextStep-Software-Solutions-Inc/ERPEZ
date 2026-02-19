using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.EconomicIndicator.Commands.CreateEconomicIndicator;

public record CreateEconomicIndicatorCommand : IRequest<ApiResponse<Guid>>
{
    public Guid FiscalYearId { get; init; }
    public decimal VATRate { get; init; }
    public decimal InflationRate { get; init; }
    public decimal IncomeTaxRate { get; init; }
}
