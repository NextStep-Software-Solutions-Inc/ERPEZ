using ERPEZ.TenantManagement.Application.Features.Licenses.Commands.ClaimTrialLicense;
using ERPEZ.TenantManagement.Application.UnitTests;
using Xunit;

namespace ERPEZ.TenantManagement.Application.UnitTests.Features.Licenses.Commands.ClaimTrialLicense;

public class ClaimTrialLicenseCommandValidatorTests : ValidatorTestBase<ClaimTrialLicenseCommandValidator, ClaimTrialLicenseCommand>
{
    [Fact]
    public void Validate_WhenTenantIdEmpty_ShouldFail()
    {
        var command = new ClaimTrialLicenseCommand
        {
            TenantId = Guid.Empty
        };

        AssertPropertyHasError(command, nameof(command.TenantId), "TenantId cannot be empty.");
    }

    [Fact]
    public void Validate_WhenTenantIdValid_ShouldPass()
    {
        var command = new ClaimTrialLicenseCommand
        {
            TenantId = Guid.NewGuid(),
            AllowedDomain = "localhost"
        };

        AssertValidationPasses(command);
    }
}
