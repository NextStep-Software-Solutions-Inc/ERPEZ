namespace ERPEZ.Application.Features.Planning.FundSource.Dtos;

public class FundSourceResponse
{
    public Guid Id { get; set; }
    public Guid? ParentId { get; set; }
    public required string Name { get; set; }
    public required string Code { get; set; }
    public required string Type { get; set; }
    public bool IsActive { get; set; }
    public required decimal TotalReceivedFunds { get; set; }
    public required decimal TotalDUAllocatedFunds { get; set; }
    public DateTime CreatedAt { get; set; }
    public required string CreatedBy { get; set; }
}
