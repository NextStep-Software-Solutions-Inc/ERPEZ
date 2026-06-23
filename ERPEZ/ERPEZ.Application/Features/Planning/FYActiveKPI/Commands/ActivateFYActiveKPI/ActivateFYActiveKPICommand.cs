using ERPEZ.Application.Features.Planning.FYActiveKPI.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Commands.ActivateFYActiveKPI;

public record ActivateFYActiveKPICommand : IRequest<ApiResponse<List<FYActiveKPIResponse>>>
{
    public Guid FiscalYearId { get; init; }
    public string CloneMode { get; init; } = ActivationCloneModes.master;
    public Guid? SourceFiscalYearId { get; init; }
    public List<ActivateKPIRequest> KPIs { get; init; } = [];
}

public static class ActivationCloneModes
{
    public const string master = "Master";
    public const string sourceFiscalYear = "SourceFY";
}
