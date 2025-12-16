    namespace ERPEZ.Application.Features.Planning.DUAllocation.Dtos;
    public record DUAllocationStatsResponse
    {
        public decimal TotalAllocatedAmount { get; init; }
        public decimal TotalUtilizedAmount { get; init; }
        public decimal TotalRemainingAmount => TotalAllocatedAmount - TotalUtilizedAmount;
    }