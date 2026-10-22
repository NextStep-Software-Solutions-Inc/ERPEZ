namespace ERPEZ.Application.Features.Planning.GeneralRatingScale.Dtos;

public record GeneralRatingScaleResponse
{
    public Guid Id { get; init; }
    public Guid FiscalYearId { get; init; }
    public int FiscalYearYear { get; init; }
    public string AdjectivalRatingName { get; init; } = string.Empty;
    public decimal MinScore { get; init; }
    public decimal MaxScore { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }
}
