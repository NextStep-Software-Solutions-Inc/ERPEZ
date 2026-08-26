namespace ERPEZ.Application.Features.Planning.Position.Dtos;

public record PositionStatisticsResponse
{
    public required int TotalPositions { get; init; }
    public required int TotalActiveIncumbents { get; init; }
    public required int VacancyVariance { get; init; }
    public required int FilledPositions { get; init; }
    public required int VacantPositions { get; init; }
    public required int AbolishedPositions { get; init; }
}
