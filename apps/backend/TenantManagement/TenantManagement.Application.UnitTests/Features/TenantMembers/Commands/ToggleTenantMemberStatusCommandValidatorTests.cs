using ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.ToggleTenantMemberStatus;
using ERPEZ.TenantManagement.Application.UnitTests;
using ERPEZ.TenantManagement.Domain.Enums;
using Xunit;

namespace TenantManagement.Application.UnitTests.Features.TenantMembers.Commands;

public class ToggleTenantMemberStatusCommandValidatorTests : ValidatorTestBase<ToggleTenantMemberStatusCommandValidator, ToggleTenantMemberStatusCommand>
{
    [Theory]
    [InlineData(Status.Active)]
    [InlineData(Status.Disabled)]
    public void Validate_ValidStatus_Passes(Status status)
    {
        var command = new ToggleTenantMemberStatusCommand
        {
            Id = Guid.NewGuid(),
            ConcurrencyStamp = Guid.NewGuid(),
            Status = status
        };

        AssertValidationPasses(command);
    }

    [Fact]
    public void Validate_EmptyId_Fails()
    {
        var command = new ToggleTenantMemberStatusCommand
        {
            Id = Guid.Empty,
            ConcurrencyStamp = Guid.NewGuid(),
            Status = Status.Active
        };

        AssertPropertyHasError(command, "Id", "Member ID is required.");
    }

    [Fact]
    public void Validate_EmptyConcurrencyStamp_Fails()
    {
        var command = new ToggleTenantMemberStatusCommand
        {
            Id = Guid.NewGuid(),
            ConcurrencyStamp = Guid.Empty,
            Status = Status.Active
        };

        AssertPropertyHasError(command, "ConcurrencyStamp", "ConcurrencyStamp is required.");
    }

    [Theory]
    [InlineData(Status.Pending)]
    [InlineData(Status.Inactive)]
    [InlineData(Status.Cancelled)]
    public void Validate_InvalidStatus_Fails(Status invalidStatus)
    {
        var command = new ToggleTenantMemberStatusCommand
        {
            Id = Guid.NewGuid(),
            ConcurrencyStamp = Guid.NewGuid(),
            Status = invalidStatus
        };

        AssertPropertyHasError(command, "Status", "Status must be either Active or Disabled.");
    }
}
