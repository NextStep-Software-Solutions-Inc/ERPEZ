using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.EconomicIndicator.Commands.UpdateEconomicIndicator;

public record UpdateEconomicIndicatorRequest
{
    public decimal VATRate { get; init; }
    public decimal InflationRate { get; init; }
    public decimal IncomeTaxRate { get; init; }
}

public record UpdateEconomicIndicatorCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public decimal VATRate { get; init; }
    public decimal InflationRate { get; init; }
    public decimal IncomeTaxRate { get; init; }
}
