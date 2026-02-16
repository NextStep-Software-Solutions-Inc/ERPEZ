using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.EconomicIndicator.Commands.UpdateEconomicIndicator;

public record UpdateEconomicIndicatorCommand : IRequest<ApiResponse<Guid>>
{
    public Guid Id { get; init; }
    public decimal VATRate { get; init; }
    public decimal InflationRate { get; init; }
    public decimal IncomeTaxRate { get; init; }
}
