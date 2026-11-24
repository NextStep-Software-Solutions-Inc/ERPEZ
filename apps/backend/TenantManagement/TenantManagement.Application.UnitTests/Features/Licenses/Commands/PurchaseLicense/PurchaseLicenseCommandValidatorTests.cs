using ERPEZ.TenantManagement.Application.Features.Licenses.Commands.PurchaseLicense;
using ERPEZ.TenantManagement.Application.UnitTests;
using Xunit;

namespace ERPEZ.TenantManagement.Application.UnitTests.Features.Licenses.Commands.PurchaseLicense;

public class PurchaseLicenseCommandValidatorTests : ValidatorTestBase<PurchaseLicenseCommandValidator, PurchaseLicenseCommand>
{
    [Fact]
    public void Validate_WhenTenantIdEmpty_ShouldFail()
    {
        var command = new PurchaseLicenseCommand
        {
            TenantId = Guid.Empty,
            AllowedDomain = "localhost"
        };

        AssertPropertyHasError(command, nameof(command.TenantId), "TenantId cannot be empty.");
    }

    [Fact]
    public void Validate_WhenAllowedDomainEmpty_ShouldFail()
    {
        var command = new PurchaseLicenseCommand
        {
            TenantId = Guid.NewGuid(),
            AllowedDomain = ""
        };

        AssertPropertyHasError(command, nameof(command.AllowedDomain), "AllowedDomain is required for cryptographic key binding.");
    }

    [Fact]
    public void Validate_WhenValidInputs_ShouldPass()
    {
        var command = new PurchaseLicenseCommand
        {
            TenantId = Guid.NewGuid(),
            AllowedDomain = "erp.internal.corp"
        };

        AssertValidationPasses(command);
    }
}
