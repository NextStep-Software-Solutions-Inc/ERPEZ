namespace ERPEZ.Application.Features.Planning.Document.Dtos;

public class AppItemDto
{
    public string  ProjectTitle                { get; set; } = string.Empty;
    public string  EndUserOrImplementingUnit   { get; set; } = string.Empty;
    public string  GeneralDescription          { get; set; } = string.Empty;
    public string  ModeOfProcurement           { get; set; } = string.Empty;
    public bool    CoveredByEpa                { get; set; }
    public string  CriteriaForBidEvaluation    { get; set; } = string.Empty;
    public string  StartOfProcurement          { get; set; } = string.Empty;
    public string  EndOfProcurement            { get; set; } = string.Empty;
    public string  SourceOfFund                { get; set; } = string.Empty;
    public decimal EstimatedBudget             { get; set; }
    public string  ProcurementStrategyOrTools  { get; set; } = string.Empty;
    public string  Remarks                     { get; set; } = string.Empty;
}