using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FunctionConfig.Commands.CreateFunctionConfig;

public record CreateFunctionConfigCommand : IRequest<ApiResponse<Guid>>
{
    public Guid FiscalYearId { get; init; }
    public decimal StrategicMinWeight { get; init; }
    public decimal? StrategicMaxWeight { get; init; }
    public decimal CoreFunctionMinWeight { get; init; }
    public decimal? CoreFunctionMaxWeight { get; init; }
    public decimal SupportMinWeight { get; init; }
    public decimal? SupportMaxWeight { get; init; }
}
