namespace ERPEZ.Application.Features.Planning.ReceivedFund.Dtos
{
    public record ReceivedFundResponse
    {
        public Guid Id { get; init; }
        public required FundSourceResponse FundSource { get; init; }
        public required decimal Amount { get; init; }
        public required decimal UtilizedAmount { get; init; }
        public decimal RemainingBalance => Amount - UtilizedAmount;
        public DateTime ReceivedDate { get; init; }
        public string? Description { get; init; }
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

