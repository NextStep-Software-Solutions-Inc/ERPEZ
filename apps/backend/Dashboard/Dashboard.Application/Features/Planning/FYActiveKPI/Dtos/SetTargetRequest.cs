namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Dtos;

public record SetTargetRequest
{
    public Guid FYActiveKPIId { get; init; }
    public decimal AgencyTargetAnnual { get; init; }
    public decimal? AgencyTargetQ1 { get; init; }
    public decimal? AgencyTargetQ2 { get; init; }
    public decimal? AgencyTargetQ3 { get; init; }
    public decimal? AgencyTargetQ4 { get; init; }
}
