using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.APP.Dtos;

public record APPResponse
{
    public Guid Id { get; init; }
    public string APPNumber { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public Guid FiscalYearId { get; init; }
    public string FiscalYearName { get; init; } = string.Empty;
    public Guid OfficeId { get; init; }
    public string OfficeName { get; init; } = string.Empty;
    public string IsFinal { get; init; } = string.Empty;
    public string? Remarks { get; init; }
    public string? Description { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime? SubmittedDate { get; init; }
    public DateTime? ApprovedDate { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }
}
