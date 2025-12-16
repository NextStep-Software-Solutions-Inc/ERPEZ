    namespace ERPEZ.Application.Features.Planning.DUAllocation.Dtos;
    public record DUAllocationStatsResponse
    {
        public decimal TotalReceivedAmount { get; init; }
        public decimal TotalAllocatedAmount { get; init; }
        public decimal TotalUtilizedAmount { get; init; }
        public decimal TotalRemainingAmount => TotalAllocatedAmount - TotalUtilizedAmount;
    }