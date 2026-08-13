namespace ERPEZ.Application.Features.Planning.Document.Dtos;

public class OpcrRatingItemDto
{
    public string  MfoPao           { get; set; } = string.Empty;
    public string  SuccessIndicator { get; set; } = string.Empty;
    public string  Target           { get; set; } = string.Empty;
    public string  Actual           { get; set; } = string.Empty;
    public decimal Rating           { get; set; }
    public string  Remarks          { get; set; } = string.Empty;
}