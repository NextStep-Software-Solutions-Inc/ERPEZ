namespace ERPEZ.Application.Features.Planning.PMTMember.Dtos;

public record PMTMemberResponse
{
    public required Guid Id { get; init; }
    public required Guid PMTId { get; init; }
    public required Guid UserId { get; init; }
    public required string Role { get; init; }
    public required DateTime AppointmentDate { get; init; }
    public DateTime? EndDate { get; init; }
    public required bool IsActive { get; init; }
    public required DateTime CreatedAt { get; init; }
    public required string CreatedBy { get; init; }
    
    // Nested objects
    public PMTDto? PMT { get; init; }
    public UserDto? User { get; init; }
}

public record PMTDto
{
    public required Guid Id { get; init; }
    public required Guid OrganizationId { get; init; }
    public required int ActiveYear { get; init; }
    public required bool IsManualWorkflow { get; init; }
    public required bool IsActive { get; init; }
    public string? OrganizationName { get; init; }
    public string? OrganizationCode { get; init; }
}

public record UserDto
{
    public required Guid Id { get; init; }
    public required string EmployeeNumber { get; init; }
    public required string Username { get; init; }
    public required string Email { get; init; }
    public required string FirstName { get; init; }
    public string? MiddleName { get; init; }
    public required string LastName { get; init; }
    public string? NameExtension { get; init; }
    public required string FullName { get; init; }
    public string? PhoneNumber { get; init; }
    public required string EmploymentStatus { get; init; }
    public DateTime? DateHired { get; init; }
    public DateTime? DateSeparated { get; init; }
    public required bool IsActive { get; init; }
    public Guid? OfficeId { get; init; }
    public string? OfficeName { get; init; }
}
