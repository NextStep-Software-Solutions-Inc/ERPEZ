using ERPEZ.TenantManagement.Application.Features.Tenants.Commands.UpdateTenant;
using ERPEZ.TenantManagement.Application.Features.Tenants.Dtos;
using ERPEZ.TenantManagement.Application.UnitTests;
using Xunit;

namespace ERPEZ.TenantManagement.Application.UnitTests.Features.Tenants.Commands.UpdateTenant;

public class UpdateTenantCommandValidatorTests : ValidatorTestBase<UpdateTenantCommandValidator, UpdateTenantCommand>
{
    [Fact]
    public void Validate_ValidCommand_ShouldPass()
    {
        // Arrange
        var command = new UpdateTenantCommand
        {
            Id = Guid.NewGuid(),
            UpdateTenant = new UpdateTenantDto
            {
                Name = "Updated Tenant Name",
                Description = "Updated description"
            }
        };

        // Act & Assert
        AssertValidationPasses(command);
    }

    [Fact]
    public void Validate_IdIsEmpty_ShouldFail()
    {
        // Arrange
        var command = new UpdateTenantCommand
        {
            Id = Guid.Empty,
            UpdateTenant = new UpdateTenantDto
            {
                Name = "Valid Name"
            }
        };

        // Act & Assert
        AssertPropertyHasError(command, nameof(command.Id), "Tenant ID is required.");
    }

    [Fact]
    public void Validate_UpdateTenantIsNull_ShouldFail()
    {
        // Arrange
        var command = new UpdateTenantCommand
        {
            Id = Guid.NewGuid(),
            UpdateTenant = null!
        };

        // Act & Assert
        AssertPropertyHasError(command, nameof(command.UpdateTenant), "Update tenant data is required.");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_NameIsEmpty_WhenProvided_ShouldFail(string emptyName)
    {
        // Arrange
        var command = new UpdateTenantCommand
        {
            Id = Guid.NewGuid(),
            UpdateTenant = new UpdateTenantDto
            {
                Name = emptyName,
                Description = "Valid description"
            }
        };

        // Act & Assert
        AssertPropertyHasError(command, "UpdateTenant.Name", "Tenant name cannot be empty if provided.");
    }

    [Fact]
    public void Validate_NameTooShort_WhenProvided_ShouldFail()
    {
        // Arrange
        var command = new UpdateTenantCommand
        {
            Id = Guid.NewGuid(),
            UpdateTenant = new UpdateTenantDto
            {
                Name = "AB",
                Description = "Valid description"
            }
        };

        // Act & Assert
        AssertPropertyHasError(command, "UpdateTenant.Name", "Tenant name must be at least 3 characters long.");
    }

    [Fact]
    public void Validate_NameTooLong_WhenProvided_ShouldFail()
    {
        // Arrange
        var longName = new string('A', 101);
        var command = new UpdateTenantCommand
        {
            Id = Guid.NewGuid(),
            UpdateTenant = new UpdateTenantDto
            {
                Name = longName,
                Description = "Valid description"
            }
        };

        // Act & Assert
        AssertPropertyHasError(command, "UpdateTenant.Name", "Tenant name cannot exceed 100 characters.");
    }

    [Theory]
    [InlineData("Tenant@Name")]
    [InlineData("Tenant#Name")]
    public void Validate_NameContainsInvalidCharacters_WhenProvided_ShouldFail(string invalidName)
    {
        // Arrange
        var command = new UpdateTenantCommand
        {
            Id = Guid.NewGuid(),
            UpdateTenant = new UpdateTenantDto
            {
                Name = invalidName,
                Description = "Valid description"
            }
        };

        // Act & Assert
        AssertPropertyHasError(command, "UpdateTenant.Name", "Tenant name can only contain letters, numbers, spaces, hyphens, underscores, and periods.");
    }

    [Fact]
    public void Validate_DescriptionTooLong_WhenProvided_ShouldFail()
    {
        // Arrange
        var longDescription = new string('A', 501);
        var command = new UpdateTenantCommand
        {
            Id = Guid.NewGuid(),
            UpdateTenant = new UpdateTenantDto
            {
                Name = "Valid Name",
                Description = longDescription
            }
        };

        // Act & Assert
        AssertPropertyHasError(command, "UpdateTenant.Description", "Description cannot exceed 500 characters.");
    }

    [Fact]
    public void Validate_NameNotProvided_ShouldPass()
    {
        // Arrange
        var command = new UpdateTenantCommand
        {
            Id = Guid.NewGuid(),
            UpdateTenant = new UpdateTenantDto
            {
                Description = "Only description update"
            }
        };

        // Act & Assert
        AssertValidationPasses(command);
    }

    [Fact]
    public void Validate_DescriptionNotProvided_ShouldPass()
    {
        // Arrange
        var command = new UpdateTenantCommand
        {
            Id = Guid.NewGuid(),
            UpdateTenant = new UpdateTenantDto
            {
                Name = "Only name update"
            }
        };

        // Act & Assert
        AssertValidationPasses(command);
    }

    [Fact]
    public void Validate_EmptyUpdateTenant_ShouldPass()
    {
        // Arrange
        var command = new UpdateTenantCommand
        {
            Id = Guid.NewGuid(),
            UpdateTenant = new UpdateTenantDto()
        };

        // Act & Assert
        AssertValidationPasses(command);
    }
}