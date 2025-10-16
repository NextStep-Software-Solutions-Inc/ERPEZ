namespace ERPEZ.Application.Features.AMS.User.Dtos;

public class UserDto
{
    public Guid Id { get; set; }
    public string AuthUserId { get; set; } = string.Empty;
    public Guid RoleId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
}
