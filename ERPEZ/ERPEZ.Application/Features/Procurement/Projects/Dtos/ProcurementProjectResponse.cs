using System;
using System.Collections.Generic;

namespace ERPEZ.Application.Features.Procurement.Projects.Dtos;

public record ProcurementProjectResponse
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public Guid ConsolidatedPRId { get; init; }
    public Guid ModeOfProcurementId { get; init; }
    public string ModeOfProcurementName { get; init; } = string.Empty;
    public decimal ABC { get; init; }
    public string Status { get; init; } = string.Empty;
    public List<BACResolutionResponse> BACResolutions { get; init; } = [];
    public List<BiddingActivityScheduleResponse> BiddingActivitySchedules { get; init; } = [];
}
