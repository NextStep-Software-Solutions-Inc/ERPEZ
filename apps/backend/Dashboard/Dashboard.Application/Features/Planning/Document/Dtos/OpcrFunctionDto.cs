namespace ERPEZ.Application.Features.Planning.Document.Dtos;

public class OpcrFunctionDto
{
    /// <summary>e.g. "CORE FUNCTIONS" or "SUPPORT FUNCTIONS"</summary>
    public string  Category         { get; set; } = string.Empty;
    public string  MfoPao           { get; set; } = string.Empty;
    public string  SuccessIndicator { get; set; } = string.Empty;
    public string  Allotment        { get; set; } = string.Empty;
    public string? Q1               { get; set; }
    public string? Q2               { get; set; }
    public string? Q3               { get; set; }
    public string? Q4               { get; set; }
    public string  Remarks          { get; set; } = string.Empty;
}