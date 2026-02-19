namespace ERPEZ.Application.Features.Planning.User.Dtos;

public record UpdateUserRequest
{
    public string? EmployeeNumber { get; init; }
    public string? Username { get; init; }
    public string? Email { get; init; }
    public string? FirstName { get; init; }
    public string? MiddleName { get; init; }
    public string? LastName { get; init; }
    public string? NameExtension { get; init; }
    public string? PhoneNumber { get; init; }
    public string? EmploymentStatus { get; init; }
    public DateTime? DateHired { get; init; }
    public DateTime? DateSeparated { get; init; }
    public bool? IsActive { get; init; }
    public Guid? OfficeId { get; init; }
}
