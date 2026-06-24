// ERPEZ.Application/Features/Planning/Document/Dtos/ConsolidatedOpcrDataDto.cs
using ERPEZ.Application.Common.Dtos;

namespace ERPEZ.Application.Features.Planning.Document.Dtos;

public class ConsolidatedOpcrDataDto
{
    public string AgencyName   { get; set; } = string.Empty;
    public string FiscalYear   { get; set; } = string.Empty;
    public string RatingPeriod { get; set; } = string.Empty;
    public decimal TotalBudget { get; set; }

    public List<ConsolidatedKpiGroupDto> KpiGroups { get; set; } = [];
    public List<SignatoryDto>            Signatories { get; set; } = [];
}

public class ConsolidatedKpiGroupDto
{
    public string MFOPAPCode           { get; set; } = string.Empty;
    public string MFOPAPName           { get; set; } = string.Empty;
    public string MFOPAPType           { get; set; } = string.Empty;
    public string PerformanceIndicator { get; set; } = string.Empty;
    public string KpiCode              { get; set; } = string.Empty;
    public string FunctionCategory     { get; set; } = string.Empty;
    public bool   IsGAD                { get; set; }
    public string MeasurementUnit      { get; set; } = string.Empty;
    public decimal KpiTotalBudget      { get; set; }

    public List<OfficeContributionDto> OfficeContributions { get; set; } = [];
}

public class OfficeContributionDto
{
    public string         OfficeName    { get; set; } = string.Empty;
    public List<string>   Activities    { get; set; } = [];
    public string         Q1Target      { get; set; } = string.Empty;
    public string         Q2Target      { get; set; } = string.Empty;
    public string         Q3Target      { get; set; } = string.Empty;
    public string         Q4Target      { get; set; } = string.Empty;
    public string         TotalTarget   { get; set; } = string.Empty;
    public decimal        AllottedBudget { get; set; }
    public string?      Remarks        { get; set; }  // ✅ Add — optional

}