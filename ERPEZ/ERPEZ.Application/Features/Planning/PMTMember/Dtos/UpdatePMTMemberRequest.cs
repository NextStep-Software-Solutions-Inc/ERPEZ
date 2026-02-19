namespace ERPEZ.Application.Features.Planning.PMTMember.Dtos;

public record UpdatePMTMemberRequest
{
    public Guid? PMTId { get; init; }
    public Guid? UserId { get; init; }
    public string? Role { get; init; }
    public DateTime? AppointmentDate { get; init; }
    public bool? IsActive { get; init; }
    public DateTime? EndDate { get; init; }
}
