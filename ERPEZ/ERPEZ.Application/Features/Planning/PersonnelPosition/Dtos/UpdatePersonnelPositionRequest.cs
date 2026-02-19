namespace ERPEZ.Application.Features.Planning.PersonnelPosition.Dtos;

public record UpdatePersonnelPositionRequest
{
    public Guid? PositionId { get; init; }
    public string? AssignmentType { get; init; }
    public bool? IsActive { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
}
