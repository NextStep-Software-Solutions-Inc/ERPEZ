namespace ERPEZ.Application.Features.Planning.Document.Dtos;

public class PpmpItemDto
{
    public string  GeneralDescription { get; set; } = string.Empty;
    public string  TypeOfProject { get; set; } = string.Empty;
    public string  QuantityAndSize { get; set; } = string.Empty;
    public string  ModeOfProcurement { get; set; } = string.Empty;
    public bool    PreProcurementConference { get; set; }
    public string  StartOfProcurement { get; set; } = string.Empty;
    public string  EndOfProcurement { get; set; } = string.Empty;
    public string  ExpectedDeliveryPeriod { get; set; } = string.Empty;
    public string  SourceOfFunds { get; set; } = string.Empty;
    public decimal EstimatedBudget { get; set; }
    public string  AttachedDocuments { get; set; } = string.Empty;
    public string  Remarks { get; set; } = string.Empty;
}