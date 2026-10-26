namespace ERPEZ.Application.Features.Planning.PersonnelPosition.Dtos;

public record PersonnelPositionResponse
{
    public required Guid Id { get; init; }
    public required Guid UserId { get; init; }
    public required Guid PositionId { get; init; }
    public required string AssignmentType { get; init; }
    public required bool IsActive { get; init; }
    public required DateTime StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public required DateTime CreatedAt { get; init; }
    public required string CreatedBy { get; init; }
    public string? PositionTitle { get; init; }
    public string? PositionCode { get; init; }
    
    // Nested objects
    public UserDto? User { get; init; }
    public PositionDto? Position { get; init; }
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

public record PositionDto
{
    public required Guid Id { get; init; }
    public required string Title { get; init; }
    public string? FunctionalTitle { get; init; }
    public required string Code { get; init; }
    public string? JobDescription { get; init; }
    public string? Qualifications { get; init; }
    public decimal? FTE { get; init; }
    public required string OperationalStatus { get; init; }
    public required Guid PositionTypeId { get; init; }
    public required Guid PlantillaTypeId { get; init; }
    public required Guid SalaryGradeId { get; init; }
    public required Guid StepId { get; init; }
    public required Guid OfficeId { get; init; }
    public string? OfficeName { get; init; }
}
