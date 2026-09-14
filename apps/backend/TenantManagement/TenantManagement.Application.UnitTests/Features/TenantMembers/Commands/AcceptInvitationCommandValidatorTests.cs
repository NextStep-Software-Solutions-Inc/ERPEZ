using ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.AcceptInvitation;
using ERPEZ.TenantManagement.Application.UnitTests;
using Xunit;

namespace TenantManagement.Application.UnitTests.Features.TenantMembers.Commands;

public class AcceptInvitationCommandValidatorTests : ValidatorTestBase<AcceptInvitationCommandValidator, AcceptInvitationCommand>
{
    [Fact]
    public void Validate_ValidToken_Passes()
    {
        var command = new AcceptInvitationCommand("valid-base64url-token-12345");

        AssertValidationPasses(command);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    public void Validate_EmptyToken_Fails(string? token)
    {
        var command = new AcceptInvitationCommand(token!);

        AssertPropertyHasError(command, "InvitationToken", "Invitation token is required.");
    }
}
