namespace ERPEZ.Application.Features.Planning.User.Dtos;

public record UserResponse
{
    public required Guid Id { get; init; }
    public required string EmployeeNumber { get; init; }
    public required string Username { get; init; }
    public required string Email { get; init; }
    public required string FirstName { get; init; }
    public string? MiddleName { get; init; }
    public required string LastName { get; init; }
    public string? NameExtension { get; init; }
    public string? PhoneNumber { get; init; }
    public required string EmploymentStatus { get; init; }
    public DateTime? DateHired { get; init; }
    public DateTime? DateSeparated { get; init; }
    public required bool IsActive { get; init; }
    public Guid? OfficeId { get; init; }
    public required DateTime CreatedAt { get; init; }
    public required string CreatedBy { get; init; }
    
    // Office details
    public string? OfficeName { get; init; }
    public string? OfficeCode { get; init; }
    
    // Computed property
    public string FullName { get; init; } = string.Empty;
}
