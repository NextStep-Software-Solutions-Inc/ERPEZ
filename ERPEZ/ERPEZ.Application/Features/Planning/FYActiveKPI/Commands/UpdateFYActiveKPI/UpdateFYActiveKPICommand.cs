using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Commands.UpdateFYActiveKPI;

public record UpdateFYActiveKPICommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public decimal AgencyTargetAnnual { get; init; }
    public decimal? AgencyTargetQ1 { get; init; }
    public decimal? AgencyTargetQ2 { get; init; }
    public decimal? AgencyTargetQ3 { get; init; }
    public decimal? AgencyTargetQ4 { get; init; }
    public string? Status { get; init; }
}
