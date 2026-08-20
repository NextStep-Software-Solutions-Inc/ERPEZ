using System;
using System.Collections.Generic;

namespace ERPEZ.Application.Features.Planning.APP.Dtos;

public class EligibleAppForProcurementDto
{
    public Guid Id { get; set; }
    public string APPNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string FiscalYearName { get; set; } = string.Empty;
    public List<EligibleAppItemDto> EligibleItems { get; set; } = [];
}

public class EligibleAppItemDto
{
    public Guid Id { get; set; }
    public string ItemNumber { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string OfficeName { get; set; } = string.Empty;
    public Guid? ProcurementModeId { get; set; }
    public string ProcurementModeName { get; set; } = string.Empty;
    public Guid? FundSourceId { get; set; }
    public string FundSourceName { get; set; } = string.Empty;
    public decimal EffectiveABC { get; set; }
}
