using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.APP.Dtos;

public record UpdateAPPSignatoriesRequest
{
    [JsonPropertyName("preparedBy")]
    public List<APPSignatoryItemRequest> PreparedBy { get; init; } = [];

    [JsonPropertyName("reviewedBy")]
    public List<APPSignatoryItemRequest> ReviewedBy { get; init; } = [];

    [JsonPropertyName("approvedBy")]
    public List<APPSignatoryItemRequest> ApprovedBy { get; init; } = [];

    [JsonPropertyName("certifiedBy")]
    public List<APPSignatoryItemRequest> CertifiedBy { get; init; } = [];
}

public record APPSignatoryItemRequest
{
    [JsonPropertyName("userId")]
    public Guid? UserId { get; init; }

    [JsonPropertyName("personnelPositionId")]
    public Guid? PersonnelPositionId { get; init; }

    [JsonPropertyName("name")]
    public string Name { get; init; } = string.Empty;

    [JsonPropertyName("position")]
    public string Position { get; init; } = string.Empty;

    [JsonPropertyName("department")]
    public string Department { get; init; } = string.Empty;

    [JsonPropertyName("signatureDate")]
    public DateTime? SignatureDate { get; init; }
}
