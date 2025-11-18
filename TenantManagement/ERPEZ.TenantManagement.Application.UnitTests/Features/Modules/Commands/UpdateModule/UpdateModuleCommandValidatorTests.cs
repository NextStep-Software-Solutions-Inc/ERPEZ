using ERPEZ.TenantManagement.Application.Features.Modules.Commands.UpdateModule;
using ERPEZ.TenantManagement.Application.Features.Modules.Dtos;
using ERPEZ.TenantManagement.Application.UnitTests;
using Xunit;

namespace ERPEZ.TenantManagement.Application.UnitTests.Features.Modules.Commands.UpdateModule;

public class UpdateModuleCommandValidatorTests : ValidatorTestBase<UpdateModuleCommandValidator, UpdateModuleCommand>
{
    [Fact]
    public void Validate_ValidCommand_ShouldPass()
    {
        // Arrange
        var command = new UpdateModuleCommand
        {
            Id = Guid.NewGuid(),
            UpdateModule = new UpdateModuleDto
            {
                Name = "Updated Module Name",
                Key = "updated-key",
                Description = "Updated description",
                IsActive = true
            }
        };

        // Act & Assert
        AssertValidationPasses(command);
    }

    [Fact]
    public void Validate_IdIsEmpty_ShouldFail()
    {
        // Arrange
        var command = new UpdateModuleCommand
        {
            Id = Guid.Empty,
            UpdateModule = new UpdateModuleDto
            {
                Name = "Valid Name"
            }
        };

        // Act & Assert
        AssertPropertyHasError(command, nameof(command.Id), "Module ID is required.");
    }

    [Fact]
    public void Validate_UpdateModuleIsNull_ShouldFail()
    {
        // Arrange
        var command = new UpdateModuleCommand
        {
            Id = Guid.NewGuid(),
            UpdateModule = null!
        };

        // Act & Assert
        AssertPropertyHasError(command, nameof(command.UpdateModule), "Update module data is required.");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_NameIsEmpty_WhenProvided_ShouldFail(string emptyName)
    {
        // Arrange
        var command = new UpdateModuleCommand
        {
            Id = Guid.NewGuid(),
            UpdateModule = new UpdateModuleDto
            {
                Name = emptyName
            }
        };

        // Act & Assert
        AssertPropertyHasError(command, "UpdateModule.Name", "Module name cannot be empty if provided.");
    }

    [Fact]
    public void Validate_NameTooShort_WhenProvided_ShouldFail()
    {
        // Arrange
        var command = new UpdateModuleCommand
        {
            Id = Guid.NewGuid(),
            UpdateModule = new UpdateModuleDto
            {
                Name = "A"
            }
        };

        // Act & Assert
        AssertPropertyHasError(command, "UpdateModule.Name", "Module name must be at least 2 characters long.");
    }

    [Fact]
    public void Validate_NameTooLong_WhenProvided_ShouldFail()
    {
        // Arrange
        var longName = new string('A', 101);
        var command = new UpdateModuleCommand
        {
            Id = Guid.NewGuid(),
            UpdateModule = new UpdateModuleDto
            {
                Name = longName
            }
        };

        // Act & Assert
        AssertPropertyHasError(command, "UpdateModule.Name", "Module name cannot exceed 100 characters.");
    }

    [Theory]
    [InlineData("Module@Name")]
    [InlineData("Module#Name")]
    public void Validate_NameContainsInvalidCharacters_WhenProvided_ShouldFail(string invalidName)
    {
        // Arrange
        var command = new UpdateModuleCommand
        {
            Id = Guid.NewGuid(),
            UpdateModule = new UpdateModuleDto
            {
                Name = invalidName
            }
        };

        // Act & Assert
        AssertPropertyHasError(command, "UpdateModule.Name", "Module name can only contain letters, numbers, spaces, hyphens, underscores, and periods.");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_KeyIsEmpty_WhenProvided_ShouldFail(string emptyKey)
    {
        // Arrange
        var command = new UpdateModuleCommand
        {
            Id = Guid.NewGuid(),
            UpdateModule = new UpdateModuleDto
            {
                Key = emptyKey
            }
        };

        // Act & Assert
        AssertPropertyHasError(command, "UpdateModule.Key", "Module key cannot be empty if provided.");
    }

    [Fact]
    public void Validate_KeyTooShort_WhenProvided_ShouldFail()
    {
        // Arrange
        var command = new UpdateModuleCommand
        {
            Id = Guid.NewGuid(),
            UpdateModule = new UpdateModuleDto
            {
                Key = "A"
            }
        };

        // Act & Assert
        AssertPropertyHasError(command, "UpdateModule.Key", "Module key must be at least 2 characters long.");
    }

    [Fact]
    public void Validate_KeyTooLong_WhenProvided_ShouldFail()
    {
        // Arrange
        var longKey = new string('a', 51);
        var command = new UpdateModuleCommand
        {
            Id = Guid.NewGuid(),
            UpdateModule = new UpdateModuleDto
            {
                Key = longKey
            }
        };

        // Act & Assert
        AssertPropertyHasError(command, "UpdateModule.Key", "Module key cannot exceed 50 characters.");
    }

    [Theory]
    [InlineData("key@with@symbols")]
    [InlineData("key with spaces")]
    [InlineData("key.with.dots")]
    public void Validate_KeyContainsInvalidCharacters_WhenProvided_ShouldFail(string invalidKey)
    {
        // Arrange
        var command = new UpdateModuleCommand
        {
            Id = Guid.NewGuid(),
            UpdateModule = new UpdateModuleDto
            {
                Key = invalidKey
            }
        };

        // Act & Assert
        AssertPropertyHasError(command, "UpdateModule.Key", "Module key can only contain letters, numbers, hyphens, and underscores.");
    }

    [Fact]
    public void Validate_DescriptionTooLong_WhenProvided_ShouldFail()
    {
        // Arrange
        var longDescription = new string('A', 501);
        var command = new UpdateModuleCommand
        {
            Id = Guid.NewGuid(),
            UpdateModule = new UpdateModuleDto
            {
                Description = longDescription
            }
        };

        // Act & Assert
        AssertPropertyHasError(command, "UpdateModule.Description", "Description cannot exceed 500 characters.");
    }

    [Fact]
    public void Validate_EmptyUpdateModule_ShouldPass()
    {
        // Arrange
        var command = new UpdateModuleCommand
        {
            Id = Guid.NewGuid(),
            UpdateModule = new UpdateModuleDto()
        };

        // Act & Assert
        AssertValidationPasses(command);
    }
}
