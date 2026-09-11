using ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.UpdateTenantMember;
using ERPEZ.TenantManagement.Application.Features.TenantMembers.Dtos;
using ERPEZ.TenantManagement.Application.UnitTests;
using Xunit;

namespace TenantManagement.Application.UnitTests.Features.TenantMembers.Commands;

public class UpdateTenantMemberCommandValidatorTests : ValidatorTestBase<UpdateTenantMemberCommandValidator, UpdateTenantMemberCommand>
{
    [Fact]
    public void Validate_ValidCommand_Passes()
    {
        var command = new UpdateTenantMemberCommand
        {
            Id = Guid.NewGuid(),
            UpdateTenantMember = new UpdateTenantMemberDto
            {
                ConcurrencyStamp = Guid.NewGuid(),
                RoleIds = [Guid.NewGuid()]
            }
        };

        AssertValidationPasses(command);
    }

    [Fact]
    public void Validate_EmptyId_Fails()
    {
        var command = new UpdateTenantMemberCommand
        {
            Id = Guid.Empty,
            UpdateTenantMember = new UpdateTenantMemberDto
            {
                ConcurrencyStamp = Guid.NewGuid(),
                RoleIds = [Guid.NewGuid()]
            }
        };

        AssertPropertyHasError(command, "Id", "Member ID is required.");
    }

    [Fact]
    public void Validate_EmptyConcurrencyStamp_Fails()
    {
        var command = new UpdateTenantMemberCommand
        {
            Id = Guid.NewGuid(),
            UpdateTenantMember = new UpdateTenantMemberDto
            {
                ConcurrencyStamp = Guid.Empty,
                RoleIds = [Guid.NewGuid()]
            }
        };

        AssertPropertyHasError(command, "UpdateTenantMember.ConcurrencyStamp", "ConcurrencyStamp is required.");
    }

    [Fact]
    public void Validate_EmptyRoleIds_Fails()
    {
        var command = new UpdateTenantMemberCommand
        {
            Id = Guid.NewGuid(),
            UpdateTenantMember = new UpdateTenantMemberDto
            {
                ConcurrencyStamp = Guid.NewGuid(),
                RoleIds = []
            }
        };

        AssertPropertyHasError(command, "UpdateTenantMember.RoleIds", "At least one role must be assigned.");
    }
}
