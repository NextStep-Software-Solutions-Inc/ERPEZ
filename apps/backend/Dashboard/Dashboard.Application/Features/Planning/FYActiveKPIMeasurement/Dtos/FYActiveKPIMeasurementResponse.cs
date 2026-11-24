namespace ERPEZ.Application.Features.Planning.FYActiveKPIMeasurement.Dtos;

public record FYActiveKPIMeasurementResponse
{
    public Guid Id { get; init; }
    public Guid FYActiveKPIId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Statement { get; init; } = string.Empty;
    public List<string> Dimensions { get; init; } = [];
    public List<string> MOVs { get; init; } = [];
    public Guid? RatingScaleTemplateId { get; init; }
    public bool IsMOVEditable { get; init; }
    public bool IsScaleEditable { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
}
