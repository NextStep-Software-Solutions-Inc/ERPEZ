using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.APPItemSchedule.Dtos;

public record APPItemScheduleResponse
{
    public Guid Id { get; init; }
    public Guid PPMPItemId { get; init; }
    public Guid ProcurementActivityTypeId { get; init; }
    public string ProcurementActivityTypeName { get; init; } = string.Empty;
    public DateTime? ScheduledDate { get; init; }
    public string? CustomDateText { get; init; }
    public List<Guid> APPItemIds { get; init; } = [];
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }

    [JsonPropertyName("PPMPItem")]
    public APPItemSchedulePPMPItemResponse? PPMPItem { get; init; }

    [JsonPropertyName("ProcurementActivityType")]
    public APPItemScheduleProcurementActivityTypeResponse? ProcurementActivityType { get; init; }

    [JsonPropertyName("APPItems")]
    public List<APPItemScheduleAPPItemResponse> APPItems { get; init; } = [];
}

public record APPItemSchedulePPMPItemResponse
{
    public Guid Id { get; init; }
    public string? PAPCode { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Unit { get; init; } = string.Empty;
    public decimal UnitPrice { get; init; }
}

public record APPItemScheduleProcurementActivityTypeResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
}

public record APPItemScheduleAPPItemResponse
{
    public Guid Id { get; init; }
    public Guid APPId { get; init; }
    public string APPNumber { get; init; } = string.Empty;
    public string APPName { get; init; } = string.Empty;
    public Guid OfficeId { get; init; }
    public string OfficeName { get; init; } = string.Empty;
    public string PAPCode { get; init; } = string.Empty;
    public Guid ProcurementModeId { get; init; }
    public string ProcurementModeName { get; init; } = string.Empty;
}
