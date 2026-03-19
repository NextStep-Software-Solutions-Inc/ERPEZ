namespace ERPEZ.Application.Features.Planning.FYActiveKPIMeasurement.Dtos;

public record FYActiveKPIMeasurementResponse
{
    public Guid Id { get; init; }
    public Guid FYActiveKPIId { get; init; }
    public string Dimension { get; init; } = string.Empty;
    public List<string> MOVs { get; init; } = [];
    public Guid? RatingScaleTemplateId { get; init; }
    public bool IsMOVEditable { get; init; }
    public bool IsScaleEditable { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
}
