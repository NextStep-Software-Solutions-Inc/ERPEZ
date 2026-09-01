using System;
using System.Collections.Generic;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Dtos;

public class CreateDirectAcquisitionRequest
{
    public string? DANumber { get; set; }
    public Guid ConsolidatedPRId { get; set; }
    public Guid? BACProjectId { get; set; }
    public List<Guid>? SelectedItemIds { get; set; }
    public decimal? TotalABC { get; set; }
}
