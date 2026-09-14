using ERPEZ.TenantManagement.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace TenantManagement.Application.UnitTests.Domain;

public class RoleAssignabilityPredicateTests
{
    private readonly Guid tenantId = Guid.NewGuid();
    private readonly Guid otherTenantId = Guid.NewGuid();

    [Fact]
    public void IsAssignableTo_SystemRole_WhenAssignableFlagTrue_ReturnsTrue()
    {
        var role = new Role
        {
            Id = Guid.NewGuid(),
            Name = "Operational Role",
            TenantId = null,
            IsSystemRole = true,
            IsAssignableToTenant = true,
            IsDeleted = false
        };

        role.IsAssignableTo(tenantId).Should().BeTrue();
    }

    [Fact]
    public void IsAssignableTo_SystemRole_WhenAssignableFlagFalse_ReturnsFalse()
    {
        var role = new Role
        {
            Id = Guid.NewGuid(),
            Name = "Super Admin Internal Role",
            TenantId = null,
            IsSystemRole = true,
            IsAssignableToTenant = false,
            IsDeleted = false
        };

        role.IsAssignableTo(tenantId).Should().BeFalse();
    }

    [Fact]
    public void IsAssignableTo_DeletedRole_ReturnsFalse()
    {
        var role = new Role
        {
            Id = Guid.NewGuid(),
            Name = "Deleted Role",
            TenantId = tenantId,
            IsSystemRole = false,
            IsAssignableToTenant = true,
            IsDeleted = true
        };

        role.IsAssignableTo(tenantId).Should().BeFalse();
    }

    [Fact]
    public void IsAssignableTo_TenantCustomRole_SameTenant_ReturnsTrue()
    {
        var role = new Role
        {
            Id = Guid.NewGuid(),
            Name = "Finance Officer",
            TenantId = tenantId,
            IsSystemRole = false,
            IsAssignableToTenant = true,
            IsDeleted = false
        };

        role.IsAssignableTo(tenantId).Should().BeTrue();
    }

    [Fact]
    public void IsAssignableTo_TenantCustomRole_DifferentTenant_ReturnsFalse()
    {
        var role = new Role
        {
            Id = Guid.NewGuid(),
            Name = "Foreign Tenant Officer",
            TenantId = otherTenantId,
            IsSystemRole = false,
            IsAssignableToTenant = true,
            IsDeleted = false
        };

        role.IsAssignableTo(tenantId).Should().BeFalse();
    }

    [Fact]
    public void IsAssignableToTenantPredicate_ExpressionFilter_WorksCorrectlyInQuery()
    {
        var roles = new List<Role>
        {
            new() { Id = Guid.NewGuid(), Name = "R1", TenantId = null, IsAssignableToTenant = true, IsDeleted = false },
            new() { Id = Guid.NewGuid(), Name = "R2", TenantId = null, IsAssignableToTenant = false, IsDeleted = false },
            new() { Id = Guid.NewGuid(), Name = "R3", TenantId = tenantId, IsAssignableToTenant = true, IsDeleted = false },
            new() { Id = Guid.NewGuid(), Name = "R4", TenantId = otherTenantId, IsAssignableToTenant = true, IsDeleted = false },
            new() { Id = Guid.NewGuid(), Name = "R5", TenantId = tenantId, IsAssignableToTenant = true, IsDeleted = true },
        };

        var predicate = Role.IsAssignableToTenantPredicate(tenantId).Compile();
        var assignable = roles.Where(predicate).ToList();

        assignable.Should().HaveCount(2);
        assignable.Select(r => r.Name).Should().BeEquivalentTo(["R1", "R3"]);
    }
}
