namespace ERPEZ.Application.Features.Planning.KPIMeasurement.Dtos;

public record KPIMeasurementResponse
{
    public Guid Id { get; init; }
    public Guid KPIId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Statement { get; init; } = string.Empty;
    public string Dimension { get; init; } = string.Empty;
    public List<string> Dimensions { get; init; } = [];
    public List<string> MOVs { get; init; } = [];
    public Guid? RatingScaleTemplateId { get; init; }
    public bool IsMOVEditable { get; init; }
    public bool IsScaleEditable { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
}
