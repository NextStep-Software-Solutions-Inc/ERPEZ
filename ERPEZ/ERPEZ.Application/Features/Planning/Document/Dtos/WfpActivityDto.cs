namespace ERPEZ.Application.Features.Planning.Document.Dtos;

public class WfpActivityDto
{
    /// <summary>e.g. "Data Gathering:" — bold sub-header row. Null for regular activity rows.</summary>
    public string? GroupHeader          { get; set; }
    public string  TargetActivity       { get; set; } = string.Empty;
    public string  TargetAccomplishment { get; set; } = string.Empty;
    public string? Q1                   { get; set; }
    public string? Q2                   { get; set; }
    public string? Q3                   { get; set; }
    public string? Q4                   { get; set; }
    public string  Total                { get; set; } = "100.00%";
    public string  WeightedPctTotal     { get; set; } = string.Empty;
}