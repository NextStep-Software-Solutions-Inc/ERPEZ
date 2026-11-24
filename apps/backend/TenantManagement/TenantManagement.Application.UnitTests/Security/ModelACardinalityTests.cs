using ERPEZ.Shared.Enums;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace ERPEZ.TenantManagement.Application.UnitTests.Security;

public class ModelACardinalityTests
{
    [Fact]
    public void Tenant_ShouldDefaultToKeycloakAndHealthyProjection()
    {
        var tenant = new Tenant();

        tenant.AuthProvider.Should().Be(IdentityProvider.Keycloak);
        tenant.MembershipProjectionStatus.Should().Be(MembershipProjectionStatus.Healthy);
        tenant.ExternalOrgId.Should().BeNull();
    }

    [Fact]
    public void TenantMember_ShouldDefaultToKeycloakAndVersionOne()
    {
        var member = new TenantMember();

        member.Provider.Should().Be(IdentityProvider.Keycloak);
        member.ProjectionVersion.Should().Be(1);
        member.LastReconciledAtUtc.Should().BeNull();
    }

    [Fact]
    public void DbContext_ShouldEnforceModelAEntityMetadata()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        using var dbContext = new ApplicationDbContext(options);

        var tenantEntityType = dbContext.Model.FindEntityType(typeof(Tenant));
        tenantEntityType.Should().NotBeNull();
        var tenantIndexes = tenantEntityType!.GetIndexes().ToList();
        tenantIndexes.Should().Contain(idx =>
            idx.Properties.Any(p => p.Name == nameof(Tenant.AuthProvider)) &&
            idx.Properties.Any(p => p.Name == nameof(Tenant.ExternalOrgId)) &&
            idx.IsUnique);

        var memberEntityType = dbContext.Model.FindEntityType(typeof(TenantMember));
        memberEntityType.Should().NotBeNull();
        var memberIndexes = memberEntityType!.GetIndexes().ToList();
        memberIndexes.Should().Contain(idx =>
            idx.Properties.Any(p => p.Name == nameof(TenantMember.TenantId)) &&
            idx.Properties.Any(p => p.Name == nameof(TenantMember.Provider)) &&
            idx.Properties.Any(p => p.Name == nameof(TenantMember.ExternalIdentityId)) &&
            idx.IsUnique);
    }
}
