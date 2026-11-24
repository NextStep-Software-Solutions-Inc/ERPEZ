using System.Collections.Generic;

namespace ERPEZ.Application.Features.Procurement.Dashboard.Dtos;

public record ProcurementBottleneckDto
{
    public List<StageBottleneck> Stages { get; init; } = [];
    public List<StalledItemDto> TopStalledItems { get; init; } = [];
}

public record StageBottleneck
{
    public string Stage { get; init; } = string.Empty;            // "PR → CPR", "CPR → RFQ", etc.
    public int StalledCount { get; init; }
    public double AvgStalledDays { get; init; }
    public int ThresholdDays { get; init; }
    public bool IsWorstBottleneck { get; init; }
}

public record StalledItemDto
{
    public string DocumentNo { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string OfficeName { get; init; } = string.Empty;
    public int AgeDays { get; init; }
    public string Stage { get; init; } = string.Empty;
}
