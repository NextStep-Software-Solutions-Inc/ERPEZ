namespace ERPEZ.Application.Features.Planning.KPIMeasurement.Dtos;

public record KPIMeasurementResponse
{
    public Guid Id { get; init; }
    public Guid KPIId { get; init; }
    public string Dimension { get; init; } = string.Empty;
    public List<string> MOVs { get; init; } = [];
    public Guid? RatingScaleTemplateId { get; init; }
    public bool IsMOVEditable { get; init; }
    public bool IsScaleEditable { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
}
