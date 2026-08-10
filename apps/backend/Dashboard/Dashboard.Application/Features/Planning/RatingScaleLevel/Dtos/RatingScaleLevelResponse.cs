namespace ERPEZ.Application.Features.Planning.RatingScaleLevel.Dtos;

public record RatingScaleLevelResponse
{
    public Guid Id { get; init; }
    public Guid RatingScaleTemplateId { get; init; }
    public int RatingValue { get; init; }
    public string? Description { get; init; }
    public decimal? MinValue { get; init; }
    public decimal? MaxValue { get; init; }
}
