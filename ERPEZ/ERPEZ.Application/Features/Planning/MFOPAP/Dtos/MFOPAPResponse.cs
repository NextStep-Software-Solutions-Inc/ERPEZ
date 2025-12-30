namespace ERPEZ.Application.Features.Planning.MFOPAP.Dtos
{
    public record MFOPAPResponse
    {
        public Guid Id { get; init; }
        public Guid? ParentId { get; init; }
        public required string Name { get; init; }
        public required string Code { get; init; }
        public required string Type { get; init; }
        public bool IsActive { get; init; }
    }
}


