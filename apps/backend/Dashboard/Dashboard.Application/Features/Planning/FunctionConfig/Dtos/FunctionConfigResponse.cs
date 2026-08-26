namespace ERPEZ.Application.Features.Planning.FunctionConfig.Dtos;

public record FunctionConfigResponse
{
    public Guid Id { get; init; }
    public Guid FiscalYearId { get; init; }
    public int FiscalYearYear { get; init; }
    public decimal StrategicMinWeight { get; init; }
    public decimal? StrategicMaxWeight { get; init; }
    public decimal CoreFunctionMinWeight { get; init; }
    public decimal? CoreFunctionMaxWeight { get; init; }
    public decimal SupportMinWeight { get; init; }
    public decimal? SupportMaxWeight { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }
}
