using ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.CreateTenantMember;
using ERPEZ.TenantManagement.Application.UnitTests;
using Xunit;

namespace TenantManagement.Application.UnitTests.Features.TenantMembers.Commands;

public class CreateTenantMemberCommandValidatorTests : ValidatorTestBase<CreateTenantMemberCommandValidator, CreateTenantMemberCommand>
{
    [Fact]
    public void Validate_ValidCommand_Passes()
    {
        var command = new CreateTenantMemberCommand
        {
            Email = "member@example.com",
            FirstName = "Juan",
            LastName = "Dela Cruz",
            RoleIds = [Guid.NewGuid()]
        };

        AssertValidationPasses(command);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    public void Validate_EmptyEmail_Fails(string? email)
    {
        var command = new CreateTenantMemberCommand
        {
            Email = email!,
            FirstName = "Juan",
            LastName = "Dela Cruz"
        };

        AssertPropertyHasError(command, "Email", "Email is required.");
    }

    [Fact]
    public void Validate_InvalidEmail_Fails()
    {
        var command = new CreateTenantMemberCommand
        {
            Email = "not-an-email",
            FirstName = "Juan",
            LastName = "Dela Cruz"
        };

        AssertPropertyHasError(command, "Email", "A valid email address is required.");
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    public void Validate_EmptyFirstName_Fails(string? firstName)
    {
        var command = new CreateTenantMemberCommand
        {
            Email = "member@example.com",
            FirstName = firstName!,
            LastName = "Dela Cruz"
        };

        AssertPropertyHasError(command, "FirstName", "First name is required.");
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    public void Validate_EmptyLastName_Fails(string? lastName)
    {
        var command = new CreateTenantMemberCommand
        {
            Email = "member@example.com",
            FirstName = "Juan",
            LastName = lastName!
        };

        AssertPropertyHasError(command, "LastName", "Last name is required.");
    }
}
