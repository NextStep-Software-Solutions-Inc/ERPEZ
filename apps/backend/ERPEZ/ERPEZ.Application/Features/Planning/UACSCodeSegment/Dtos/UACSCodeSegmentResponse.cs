using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.UACSCodeSegment.Dtos;

public record UACSCodeSegmentResponse
{
    public Guid Id { get; init; }
    public UACSSegmentTypeEnum SegmentType { get; init; }
    public required string Name { get; init; }
    public required string Description { get; init; }
    public int DisplayOrder { get; init; }
    public bool IsRequired { get; init; }
    public int MaxLength { get; init; }
    public required string Pattern { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public required string CreatedBy { get; init; }
}
