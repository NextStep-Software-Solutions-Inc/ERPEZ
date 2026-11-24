namespace ERPEZ.Application.Features.Planning.Document.Dtos;

public class BudgetModLineItemDto
{
    public string ObjectCode { get; set; } = string.Empty;
    public string Particulars { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}