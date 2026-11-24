using ERPEZ.TenantManagement.Application.Features.Tenants.Commands.CreateTenant;
using ERPEZ.TenantManagement.Application.UnitTests;
using Xunit;

namespace ERPEZ.TenantManagement.Application.UnitTests.Features.Tenants.Commands.CreateTenant;

public class CreateTenantCommandValidatorTests : ValidatorTestBase<CreateTenantCommandValidator, CreateTenantCommand>
{
    [Fact]
    public void Validate_ValidCommand_ShouldPass()
    {
        // Arrange
        var command = new CreateTenantCommand
        {
            Name = "Valid Tenant Name",
            Description = "A valid description for the tenant",
            OnPremise = true,
            BillingContactEmail = "billing@company.com"
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
        var command = new CreateTenantCommand
        {
            Name = invalidName!,
            Description = "Valid description",
            OnPremise = false,
            BillingContactEmail = "billing@company.com"
        };

        // Act & Assert
        AssertPropertyHasError(command, nameof(command.Name), "Tenant name is required.");
    }

    [Theory]
    [InlineData("AB")]
    [InlineData("A")]
    public void Validate_NameTooShort_ShouldFail(string shortName)
    {
        // Arrange
        var command = new CreateTenantCommand
        {
            Name = shortName,
            Description = "Valid description",
            OnPremise = false,
            BillingContactEmail = "billing@company.com"
        };

        // Act & Assert
        AssertPropertyHasError(command, nameof(command.Name), "Tenant name must be at least 3 characters long.");
    }

    [Fact]
    public void Validate_NameTooLong_ShouldFail()
    {
        // Arrange
        var longName = new string('A', 101); // 101 characters
        var command = new CreateTenantCommand
        {
            Name = longName,
            Description = "Valid description",
            OnPremise = false,
            BillingContactEmail = "billing@company.com"
        };

        // Act & Assert
        AssertPropertyHasError(command, nameof(command.Name), "Tenant name cannot exceed 100 characters.");
    }

    [Theory]
    [InlineData("Tenant@Name")]
    [InlineData("Tenant#Name")]
    [InlineData("Tenant$Name")]
    public void Validate_NameContainsInvalidCharacters_ShouldFail(string invalidName)
    {
        // Arrange
        var command = new CreateTenantCommand
        {
            Name = invalidName,
            Description = "Valid description",
            OnPremise = false,
            BillingContactEmail = "billing@company.com"
        };

        // Act & Assert
        AssertPropertyHasError(command, nameof(command.Name), "Tenant name can only contain letters, numbers, spaces, hyphens, underscores, and periods.");
    }

    [Fact]
    public void Validate_DescriptionTooLong_ShouldFail()
    {
        // Arrange
        var longDescription = new string('A', 501); // 501 characters
        var command = new CreateTenantCommand
        {
            Name = "Valid Name",
            Description = longDescription,
            OnPremise = false,
            BillingContactEmail = "billing@company.com"
        };

        // Act & Assert
        AssertPropertyHasError(command, nameof(command.Description), "Description cannot exceed 500 characters.");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_BillingContactEmailIsEmpty_ShouldFail(string? invalidEmail)
    {
        // Arrange
        var command = new CreateTenantCommand
        {
            Name = "Valid Name",
            Description = "Valid description",
            OnPremise = false,
            BillingContactEmail = invalidEmail!
        };

        // Act & Assert
        AssertPropertyHasError(command, nameof(command.BillingContactEmail), "Billing contact email is required.");
    }

    [Theory]
    [InlineData("invalid-email")]
    [InlineData("invalid@")]
    [InlineData("@invalid.com")]
    [InlineData("invalid.com")]
    public void Validate_BillingContactEmailInvalidFormat_ShouldFail(string invalidEmail)
    {
        // Arrange
        var command = new CreateTenantCommand
        {
            Name = "Valid Name",
            Description = "Valid description",
            OnPremise = false,
            BillingContactEmail = invalidEmail
        };

        // Act & Assert
        AssertPropertyHasError(command, nameof(command.BillingContactEmail), "Billing contact email must be a valid email address.");
    }

    [Fact]
    public void Validate_BillingContactEmailTooLong_ShouldFail()
    {
        // Arrange
        var longEmail = new string('a', 246) + "@example.com"; // Total > 255 characters
        var command = new CreateTenantCommand
        {
            Name = "Valid Name",
            Description = "Valid description",
            OnPremise = false,
            BillingContactEmail = longEmail
        };

        // Act & Assert
        AssertPropertyHasError(command, nameof(command.BillingContactEmail), "Billing contact email cannot exceed 255 characters.");
    }

    [Fact]
    public void Validate_AllValidInputs_ShouldPass()
    {
        // Arrange
        var command = new CreateTenantCommand
        {
            Name = "Test-Tenant_123.Valid",
            Description = "A comprehensive test tenant with all valid inputs",
            OnPremise = true,
            BillingContactEmail = "test.billing@company-domain.co.uk"
        };

        // Act & Assert
        AssertValidationPasses(command);
    }
}
