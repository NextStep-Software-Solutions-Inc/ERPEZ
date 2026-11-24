using ERPEZ.TenantManagement.Application.Features.Modules.Commands.CreateModule;
using ERPEZ.TenantManagement.Application.UnitTests;
using Xunit;

namespace ERPEZ.TenantManagement.Application.UnitTests.Features.Modules.Commands.CreateModule;

public class CreateModuleCommandValidatorTests : ValidatorTestBase<CreateModuleCommandValidator, CreateModuleCommand>
{
    [Fact]
    public void Validate_ValidCommand_ShouldPass()
    {
        // Arrange
        var command = new CreateModuleCommand
        {
            Name = "User Management",
            Key = "user-management",
            Description = "Module for managing users",
            IsActive = true
        };

        // Act & Assert
        AssertValidationPasses(command);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_NameIsEmpty_ShouldFail(string? invalidName)
    {
        // Arrange
        var command = new CreateModuleCommand
        {
            Name = invalidName!,
            Key = "valid-key",
            Description = "Valid description",
            IsActive = true
        };

        // Act & Assert
        AssertPropertyHasError(command, nameof(command.Name), "Module name is required.");
    }

    [Fact]
    public void Validate_NameTooShort_ShouldFail()
    {
        // Arrange
        var command = new CreateModuleCommand
        {
            Name = "A",
            Key = "valid-key",
            Description = "Valid description",
            IsActive = true
        };

        // Act & Assert
        AssertPropertyHasError(command, nameof(command.Name), "Module name must be at least 2 characters long.");
    }

    [Fact]
    public void Validate_NameTooLong_ShouldFail()
    {
        // Arrange
        var longName = new string('A', 101);
        var command = new CreateModuleCommand
        {
            Name = longName,
            Key = "valid-key",
            Description = "Valid description",
            IsActive = true
        };

        // Act & Assert
        AssertPropertyHasError(command, nameof(command.Name), "Module name cannot exceed 100 characters.");
    }

    [Theory]
    [InlineData("Module@Name")]
    [InlineData("Module#Name")]
    public void Validate_NameContainsInvalidCharacters_ShouldFail(string invalidName)
    {
        // Arrange
        var command = new CreateModuleCommand
        {
            Name = invalidName,
            Key = "valid-key",
            Description = "Valid description",
            IsActive = true
        };

        // Act & Assert
        AssertPropertyHasError(command, nameof(command.Name), "Module name can only contain letters, numbers, spaces, hyphens, underscores, and periods.");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_KeyIsEmpty_ShouldFail(string? invalidKey)
    {
        // Arrange
        var command = new CreateModuleCommand
        {
            Name = "Valid Name",
            Key = invalidKey!,
            Description = "Valid description",
            IsActive = true
        };

        // Act & Assert
        AssertPropertyHasError(command, nameof(command.Key), "Module key is required.");
    }

    [Fact]
    public void Validate_KeyTooShort_ShouldFail()
    {
        // Arrange
        var command = new CreateModuleCommand
        {
            Name = "Valid Name",
            Key = "A",
            Description = "Valid description",
            IsActive = true
        };

        // Act & Assert
        AssertPropertyHasError(command, nameof(command.Key), "Module key must be at least 2 characters long.");
    }

    [Fact]
    public void Validate_KeyTooLong_ShouldFail()
    {
        // Arrange
        var longKey = new string('a', 51);
        var command = new CreateModuleCommand
        {
            Name = "Valid Name",
            Key = longKey,
            Description = "Valid description",
            IsActive = true
        };

        // Act & Assert
        AssertPropertyHasError(command, nameof(command.Key), "Module key cannot exceed 50 characters.");
    }

    [Theory]
    [InlineData("key@with@symbols")]
    [InlineData("key with spaces")]
    [InlineData("key.with.dots")]
    public void Validate_KeyContainsInvalidCharacters_ShouldFail(string invalidKey)
    {
        // Arrange
        var command = new CreateModuleCommand
        {
            Name = "Valid Name",
            Key = invalidKey,
            Description = "Valid description",
            IsActive = true
        };

        // Act & Assert
        AssertPropertyHasError(command, nameof(command.Key), "Module key can only contain letters, numbers, hyphens, and underscores.");
    }

    [Fact]
    public void Validate_DescriptionTooLong_ShouldFail()
    {
        // Arrange
        var longDescription = new string('A', 501);
        var command = new CreateModuleCommand
        {
            Name = "Valid Name",
            Key = "valid-key",
            Description = longDescription,
            IsActive = true
        };

        // Act & Assert
        AssertPropertyHasError(command, nameof(command.Description), "Description cannot exceed 500 characters.");
    }

    [Fact]
    public void Validate_AllValidInputs_ShouldPass()
    {
        // Arrange
        var command = new CreateModuleCommand
        {
            Name = "Advanced Analytics Module",
            Key = "advanced-analytics",
            Description = "A comprehensive module for advanced analytics and reporting capabilities",
            IsActive = false
        };

        // Act & Assert
        AssertValidationPasses(command);
    }
}
