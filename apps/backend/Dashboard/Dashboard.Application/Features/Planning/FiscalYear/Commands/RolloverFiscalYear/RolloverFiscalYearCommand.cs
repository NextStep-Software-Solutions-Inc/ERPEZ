using ERPEZ.Application.Features.Planning.FiscalYear.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.RolloverFiscalYear;

public record RolloverFiscalYearCommand : IRequest<ApiResponse<RolloverResultResponse>>
{
    [JsonIgnore]
    public Guid TargetFiscalYearId { get; init; }
    public Guid SourceFiscalYearId { get; init; }
    public bool IncludeOrgStructure { get; init; }
    public bool IncludeUACSLibrary { get; init; }
    public bool IncludeRecurringExpenses { get; init; }
}
