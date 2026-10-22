namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Dtos
{
    public record DeliveryUnitsResponse
    {
        public Guid Id { get; init; }
        public required string OfficeName { get; init; }
        public string? ClusterName { get; init; }
        public Guid? ParentId { get; init; }
        public required int KpiCount { get; init; }
        public required int KPITargetCount { get; init; }
        public required int SubKpiCount { get; init; }
        public required int SubDUCount { get; init; }
        public DateTime CreatedAt { get; init; }

        public decimal TotalAmountAllocated { get; init; } = 0;
        public decimal TotalAmountUtilized { get; init; } = 0;
        public decimal TotalAmountRemaining => TotalAmountAllocated - TotalAmountUtilized;
        public int FundSourceCount { get; init; } = 0;

    }
}


