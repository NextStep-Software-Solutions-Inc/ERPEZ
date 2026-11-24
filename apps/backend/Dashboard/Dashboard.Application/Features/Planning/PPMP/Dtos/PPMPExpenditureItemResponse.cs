using System.Text.Json.Serialization;
using ERPEZ.Application.Features.Planning.PPMPItem.Dtos;

namespace ERPEZ.Application.Features.Planning.PPMP.Dtos;

public record PPMPExpenditureItemResponse
{
    public Guid Id { get; init; }
    public Guid PPMPId { get; init; }
    public Guid? PPMPActivityId { get; init; }
    public Guid ObjectId { get; init; }
    public bool IsProcurable { get; init; }
    public decimal TotalCost { get; init; }
    public string? PPMPActivityName { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public List<PPMPItemResponse> PPMPItems { get; init; } = [];
    
    [JsonPropertyName("PPMPActivity")]
    public PPMPActivityResponse? PPMPActivity { get; init; }
}