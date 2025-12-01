namespace ERPEZ.Application.Features.Planning.MFOPAP.Dtos
{
    public class MFOPAPResponse
    {
        public Guid Id { get; set; }
        public Guid? ParentId { get; set; }
        public required string Name { get; set; }
        public required string Code { get; set; }
        public required string Type { get; set; }
        public bool IsActive { get; set; }
    }
}


