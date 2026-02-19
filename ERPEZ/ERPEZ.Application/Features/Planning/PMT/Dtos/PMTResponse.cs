using ERPEZ.Application.Features.Planning.PMTMember.Dtos;

namespace ERPEZ.Application.Features.Planning.PMT.Dtos;

public record PMTResponse
{
    public required Guid Id { get; init; }
    public required Guid OrganizationId { get; init; }
    public required int ActiveYear { get; init; }
    public required bool IsManualWorkflow { get; init; }
    public required bool IsActive { get; init; }
    public required DateTime CreatedAt { get; init; }
    public required string CreatedBy { get; init; }
    
    // Organization details
    public string? OrganizationName { get; init; }
    public string? OrganizationCode { get; init; }
    
    // PMT Members
    public List<PMTMemberResponse>? PMTMembers { get; init; }
}
