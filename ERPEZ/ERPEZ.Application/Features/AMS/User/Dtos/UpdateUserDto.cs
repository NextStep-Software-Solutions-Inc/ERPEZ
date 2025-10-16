namespace ERPEZ.Application.Features.AMS.User.Dtos;

public class UpdateUserDto
{
    public string? AuthUserId { get; set; }
    public Guid? RoleId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Address { get; set; }
    public string? Email { get; set; }
    public string? ContactNumber { get; set; }
}
