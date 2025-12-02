namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Dtos
{
    public record DeliveryUnitsResponse
    {
        public Guid Id { get; init; }
        public required string OfficeName { get; init; }
        public Guid? ParentDUId { get; init; }
        public required int KpiCount { get; init; }
        public required int SubKpiCount { get; init; }
        public DateTime CreatedAt { get; init; }

    }
}


