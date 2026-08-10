using ERPEZ.TenantManagement.Application.Features.Tenants.Commands.DeleteTenant;
using ERPEZ.TenantManagement.Application.UnitTests;
using Xunit;

namespace ERPEZ.TenantManagement.Application.UnitTests.Features.Tenants.Commands.DeleteTenant;

public class DeleteTenantCommandValidatorTests : ValidatorTestBase<DeleteTenantCommandValidator, DeleteTenantCommand>
{
    [Fact]
    public void Validate_ValidCommand_ShouldPass()
    {
        // Arrange
        var command = new DeleteTenantCommand(Guid.NewGuid());

        // Act & Assert
        AssertValidationPasses(command);
    }

    [Fact]
    public void Validate_IdIsEmpty_ShouldFail()
    {
        // Arrange
        var command = new DeleteTenantCommand(Guid.Empty);

        // Act & Assert
        AssertPropertyHasError(command, nameof(command.Id), "Tenant ID is required.");
    }

    [Theory]
    [InlineData("00000000-0000-0000-0000-000000000000")]
    public void Validate_IdIsEmptyGuid_ShouldFail(string emptyGuidString)
    {
        // Arrange
        var emptyGuid = Guid.Parse(emptyGuidString);
        var command = new DeleteTenantCommand(emptyGuid);

        // Act & Assert
        AssertPropertyHasError(command, nameof(command.Id), "Tenant ID is required.");
    }
}
