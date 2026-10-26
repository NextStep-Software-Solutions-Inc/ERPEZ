namespace ERPEZ.Application.Features.Planning.PPMP.Dtos;

/// <summary>
/// Minimal MSF summary embedded in PPMPDetailedResponse / PPMPActivityResponse.
/// Contains only the fields needed for the PPMP UI to display and navigate to the MSF.
/// The PPMP endpoint is intentionally not a MSF detail endpoint.
/// </summary>
public record MSFSummaryResponse
{
    public Guid Id { get; init; }
    public string ProjectName { get; init; } = string.Empty;
    public decimal EstimatedBudget { get; init; }
    public string Status { get; init; } = string.Empty;
}
