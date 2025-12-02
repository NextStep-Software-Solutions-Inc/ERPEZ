namespace ERPEZ.Application.Features.Planning.ReceivedFund.Dtos
{
    public record ReceivedFundResponse
    {
        public Guid Id { get; set; }
        public required FundSourceResponse FundSource { get; set; }
        public decimal Amount { get; set; }
        public DateTime ReceivedDate { get; set; }
        public string? Description { get; set; }
    }

    public record FundSourceResponse
    {
        public Guid Id { get; init; }
        public required string Name { get; init; }
        public required string Code { get; init; }
        public required string Type { get; init; }
        public bool IsActive { get; init; }
    }

}

