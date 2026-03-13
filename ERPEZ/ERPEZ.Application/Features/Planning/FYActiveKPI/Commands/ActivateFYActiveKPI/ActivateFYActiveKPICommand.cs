using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Commands.ActivateFYActiveKPI;

public record ActivateFYActiveKPICommand : IRequest<ApiResponse<Guid>>
{
    public Guid FiscalYearId { get; init; }
    public Guid MasterKPIId { get; init; }
    public decimal AgencyTargetAnnual { get; init; }
    public decimal? AgencyTargetQ1 { get; init; }
    public decimal? AgencyTargetQ2 { get; init; }
    public decimal? AgencyTargetQ3 { get; init; }
    public decimal? AgencyTargetQ4 { get; init; }
}
