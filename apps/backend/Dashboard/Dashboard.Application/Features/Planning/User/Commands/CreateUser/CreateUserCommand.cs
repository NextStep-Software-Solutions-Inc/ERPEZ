using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.User.Commands.CreateUser;

public record CreateUserCommand : IRequest<ApiResponse<Guid>>
{
    public string? ExternalIdentityId { get; init; }
    public string EmployeeNumber { get; init; } = string.Empty;
    public string Username { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string FirstName { get; init; } = string.Empty;
    public string? MiddleName { get; init; }
    public string LastName { get; init; } = string.Empty;
    public string? NameExtension { get; init; }
    public string? PhoneNumber { get; init; }
    public string EmploymentStatus { get; init; } = "Regular";
    public DateTime? DateHired { get; init; }
    public bool IsActive { get; init; } = true;
    public Guid? OfficeId { get; init; }
}
