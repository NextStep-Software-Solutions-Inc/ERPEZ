using ERPEZ.TenantManagement.Application.Features.Modules.Commands.DeleteModule;
using ERPEZ.TenantManagement.Application.UnitTests;
using Xunit;

namespace ERPEZ.TenantManagement.Application.UnitTests.Features.Modules.Commands.DeleteModule;

public class DeleteModuleCommandValidatorTests : ValidatorTestBase<DeleteModuleCommandValidator, DeleteModuleCommand>
{
    [Fact]
    public void Validate_ValidCommand_ShouldPass()
    {
        // Arrange
        var command = new DeleteModuleCommand(Guid.NewGuid());

        // Act & Assert
        AssertValidationPasses(command);
    }

    [Fact]
    public void Validate_IdIsEmpty_ShouldFail()
    {
        // Arrange
        var command = new DeleteModuleCommand(Guid.Empty);

        // Act & Assert
        AssertPropertyHasError(command, nameof(command.Id), "Module ID is required.");
    }

    [Theory]
    [InlineData("00000000-0000-0000-0000-000000000000")]
    public void Validate_IdIsEmptyGuid_ShouldFail(string emptyGuidString)
    {
        // Arrange
        var emptyGuid = Guid.Parse(emptyGuidString);
        var command = new DeleteModuleCommand(emptyGuid);

        // Act & Assert
        AssertPropertyHasError(command, nameof(command.Id), "Module ID is required.");
    }
}