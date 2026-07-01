namespace ERPEZ.Application.Features.Procurement.AOBs.Dtos;

public record AwardItemInputDto
{
    public required Guid APPItemId { get; init; }
    public required Guid WinningSupplierId { get; init; }
    public required decimal AwardedUnitPrice { get; init; }
    public decimal Score { get; init; }
}
