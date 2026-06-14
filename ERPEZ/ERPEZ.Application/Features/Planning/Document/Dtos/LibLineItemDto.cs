namespace ERPEZ.Application.Features.Planning.Document.Dtos;

public class LibLineItemDto
{
     public string ObjectCode { get; set; } = string.Empty;
    public string Particulars { get; set; } = string.Empty;
    public decimal AuthorizedBudget { get; set; }
    public decimal Obligation { get; set; }
    public decimal Balance { get; set; }
    public string  Remarks { get; set; } = string.Empty;
}