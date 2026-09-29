using System.Text.Json;
using ERPEZ.Shared.Enums;
using ERPEZ.TenantManagement.Application.Common.Interfaces;
using ERPEZ.TenantManagement.Application.Common.Models;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Infrastructure.Persistence;
using ERPEZ.TenantManagement.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace ERPEZ.TenantManagement.Application.UnitTests.Webhooks;

public class WebhookInboxServiceTests : IDisposable
{
    private readonly ApplicationDbContext dbContext;
    private readonly Mock<IClerkMembershipReader> membershipReaderMock = new();
    private readonly Mock<ILogger<WebhookInboxService>> loggerMock = new();
    private readonly WebhookInboxService inboxService;

    public WebhookInboxServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        dbContext = new ApplicationDbContext(options);
        inboxService = new WebhookInboxService(dbContext, membershipReaderMock.Object, loggerMock.Object);
    }

    public void Dispose()
    {
        dbContext.Database.EnsureDeleted();
        dbContext.Dispose();
    }

    [Fact]
    public async Task IngestAsync_WhenNewMessage_ReturnsAcceptedAndPersistsPending()
    {
        var svixId = "msg_unique_1";
        var payload = JsonSerializer.Serialize(new
        {
            id = "evt_clerk_1",
            type = "organizationMembership.created"
        });

        var result = await inboxService.IngestAsync(svixId, payload);

        result.Should().Be(WebhookIngestionStatus.Accepted);

        var record = await dbContext.WebhookInbox!.FirstOrDefaultAsync(w => w.SvixMessageId == svixId);
        record.Should().NotBeNull();
        record!.Status.Should().Be(WebhookProcessingStatus.Pending);
        record.ProviderEventId.Should().Be("evt_clerk_1");
        record.EventType.Should().Be("organizationMembership.created");
    }

    [Fact]
    public async Task IngestAsync_WhenDuplicateProcessedMessage_ReturnsDuplicate()
    {
        var svixId = "msg_duplicate_1";
        dbContext.WebhookInbox!.Add(new WebhookInboxRecord
        {
            SvixMessageId = svixId,
            ProviderEventId = "evt_clerk_dup",
            EventType = "organizationMembership.created",
            PayloadJson = "{}",
            Status = WebhookProcessingStatus.Processed
        });
        await dbContext.SaveChangesAsync();

        var result = await inboxService.IngestAsync(svixId, "{}");

        result.Should().Be(WebhookIngestionStatus.Duplicate);
    }

    [Fact]
    public async Task ProcessSingleRecordAsync_WhenOrganizationDeleted_DisablesTenant()
    {
        var tenantId = Guid.NewGuid();
        var externalOrgId = "org_deleted_123";

        dbContext.Tenants!.Add(new Tenant
        {
            Id = tenantId,
            Name = "Org To Delete",
            AuthProvider = IdentityProvider.Clerk,
            ExternalOrgId = externalOrgId,
            IsDisabled = false,
            ProvisioningState = TenantProvisioningState.Ready
        });

        var payload = JsonSerializer.Serialize(new
        {
            id = "evt_del_1",
            type = "organization.deleted",
            data = new { id = externalOrgId }
        });

        var record = new WebhookInboxRecord
        {
            SvixMessageId = "msg_org_del",
            ProviderEventId = "evt_del_1",
            EventType = "organization.deleted",
            PayloadJson = payload,
            Status = WebhookProcessingStatus.Pending
        };
        dbContext.WebhookInbox!.Add(record);
        await dbContext.SaveChangesAsync();

        var success = await inboxService.ProcessSingleRecordAsync(record.Id);

        success.Should().BeTrue();

        var updatedTenant = await dbContext.Tenants.FirstAsync(t => t.Id == tenantId);
        updatedTenant.IsDisabled.Should().BeTrue();
        updatedTenant.ProvisioningState.Should().Be(TenantProvisioningState.Disabled);
        updatedTenant.LastProcessedEventId.Should().Be("evt_del_1");
        updatedTenant.LastSuccessfulWebhookProcessingAtUtc.Should().NotBeNull();

        var updatedRecord = await dbContext.WebhookInbox.FirstAsync(w => w.Id == record.Id);
        updatedRecord.Status.Should().Be(WebhookProcessingStatus.Processed);
    }

    [Fact]
    public async Task ProcessSingleRecordAsync_WhenMembershipCreated_CreatesTenantMemberWithModelACardinality()
    {
        var tenantId = Guid.NewGuid();
        var externalOrgId = "org_clerk_membership";
        var externalUserId = "user_clerk_new";

        dbContext.Tenants!.Add(new Tenant
        {
            Id = tenantId,
            Name = "Clerk Tenant",
            AuthProvider = IdentityProvider.Clerk,
            ExternalOrgId = externalOrgId,
            IsDisabled = false,
            ProvisioningState = TenantProvisioningState.Ready
        });

        membershipReaderMock
            .Setup(r => r.GetMembershipAsync(externalOrgId, externalUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ClerkMembershipDto(externalOrgId, externalUserId, "admin", true));

        var payload = JsonSerializer.Serialize(new
        {
            id = "evt_mem_1",
            type = "organizationMembership.created",
            data = new
            {
                organization = new { id = externalOrgId },
                public_user_data = new { user_id = externalUserId }
            }
        });

        var record = new WebhookInboxRecord
        {
            SvixMessageId = "msg_mem_1",
            ProviderEventId = "evt_mem_1",
            EventType = "organizationMembership.created",
            PayloadJson = payload,
            Status = WebhookProcessingStatus.Pending
        };
        dbContext.WebhookInbox!.Add(record);
        await dbContext.SaveChangesAsync();

        var success = await inboxService.ProcessSingleRecordAsync(record.Id);

        success.Should().BeTrue();

        var member = await dbContext.TenantMembers!.FirstOrDefaultAsync(m => m.TenantId == tenantId && m.ExternalIdentityId == externalUserId);
        member.Should().NotBeNull();
        member!.Provider.Should().Be(IdentityProvider.Clerk);
        member.Status.Should().Be(Status.Active);
        member.LastReconciledAtUtc.Should().NotBeNull();
    }

    [Fact]
    public async Task ProcessSingleRecordAsync_WhenMembershipDeleted_DeactivatesTenantMember()
    {
        var tenantId = Guid.NewGuid();
        var externalOrgId = "org_clerk_membership_del";
        var externalUserId = "user_clerk_del";

        dbContext.Tenants!.Add(new Tenant
        {
            Id = tenantId,
            Name = "Clerk Tenant",
            AuthProvider = IdentityProvider.Clerk,
            ExternalOrgId = externalOrgId,
            IsDisabled = false,
            ProvisioningState = TenantProvisioningState.Ready
        });

        dbContext.TenantMembers!.Add(new TenantMember
        {
            TenantId = tenantId,
            Provider = IdentityProvider.Clerk,
            ExternalIdentityId = externalUserId,
            Status = Status.Active,
            ProjectionVersion = 1
        });

        var payload = JsonSerializer.Serialize(new
        {
            id = "evt_mem_del",
            type = "organizationMembership.deleted",
            data = new
            {
                organization = new { id = externalOrgId },
                public_user_data = new { user_id = externalUserId }
            }
        });

        var record = new WebhookInboxRecord
        {
            SvixMessageId = "msg_mem_del",
            ProviderEventId = "evt_mem_del",
            EventType = "organizationMembership.deleted",
            PayloadJson = payload,
            Status = WebhookProcessingStatus.Pending
        };
        dbContext.WebhookInbox!.Add(record);
        await dbContext.SaveChangesAsync();

        var success = await inboxService.ProcessSingleRecordAsync(record.Id);

        success.Should().BeTrue();

        var member = await dbContext.TenantMembers!.FirstAsync(m => m.TenantId == tenantId && m.ExternalIdentityId == externalUserId);
        member.Status.Should().Be(Status.Inactive);
        member.ProjectionVersion.Should().Be(2);
    }

    [Fact]
    public async Task ProcessSingleRecordAsync_WhenUserCreated_CreatesTenantMemberWithRoles()
    {
        var tenantId = Guid.NewGuid();
        var externalUserId = "user_clerk_created_123";
        var userEmail = "newbie@company.org";
        var roleId = Guid.NewGuid();

        dbContext.Tenants!.Add(new Tenant
        {
            Id = tenantId,
            Name = "Acme Corp",
            AuthProvider = IdentityProvider.Clerk,
            IsDisabled = false,
            ProvisioningState = TenantProvisioningState.Ready
        });

        dbContext.Roles!.Add(new Role
        {
            Id = roleId,
            Name = "Billing Administrator",
            NormalizedName = "BILLING ADMINISTRATOR",
            Scope = RoleScope.Tenant
        });
        await dbContext.SaveChangesAsync();

        var payload = JsonSerializer.Serialize(new
        {
            id = "evt_usr_created_1",
            type = "user.created",
            data = new
            {
                id = externalUserId,
                first_name = "Alice",
                last_name = "Wonderland",
                email_addresses = new[]
                {
                    new { id = "email_1", email_address = userEmail }
                },
                primary_email_address_id = "email_1",
                public_metadata = new
                {
                    tenantId = tenantId.ToString(),
                    roleIds = new[] { roleId.ToString() },
                    invitationType = "tenant_member"
                }
            }
        });

        var record = new WebhookInboxRecord
        {
            SvixMessageId = "msg_usr_created_1",
            ProviderEventId = "evt_usr_created_1",
            EventType = "user.created",
            PayloadJson = payload,
            Status = WebhookProcessingStatus.Pending
        };
        dbContext.WebhookInbox!.Add(record);
        await dbContext.SaveChangesAsync();

        var success = await inboxService.ProcessSingleRecordAsync(record.Id);

        success.Should().BeTrue();

        var member = await dbContext.TenantMembers!
            .Include(m => m.RoleAssignments)
            .FirstOrDefaultAsync(m => m.TenantId == tenantId && m.ExternalIdentityId == externalUserId);

        member.Should().NotBeNull();
        member!.Email.Should().Be(userEmail);
        member.FirstName.Should().Be("Alice");
        member.LastName.Should().Be("Wonderland");
        member.Status.Should().Be(Status.Active);
        member.RoleAssignments.Should().ContainSingle(ra => ra.RoleId == roleId);
    }

    [Fact]
    public async Task ProcessSingleRecordAsync_WhenUserCreated_ActivatesExistingPendingMember()
    {
        var tenantId = Guid.NewGuid();
        var externalUserId = "user_clerk_activated_456";
        var userEmail = "invited@company.org";
        var roleId = Guid.NewGuid();

        dbContext.Tenants!.Add(new Tenant
        {
            Id = tenantId,
            Name = "Acme Corp",
            AuthProvider = IdentityProvider.Clerk,
            IsDisabled = false,
            ProvisioningState = TenantProvisioningState.Ready
        });

        var pendingMember = new TenantMember
        {
            TenantId = tenantId,
            Provider = IdentityProvider.Clerk,
            Email = userEmail,
            FirstName = "Invited",
            LastName = "User",
            Status = Status.Pending,
            InvitationTokenHash = "hash123",
            InvitationExpiresAtUtc = DateTime.UtcNow.AddDays(2)
        };
        pendingMember.RoleAssignments.Add(new TenantMemberRoleAssignment { RoleId = roleId });
        dbContext.TenantMembers!.Add(pendingMember);
        await dbContext.SaveChangesAsync();

        var payload = JsonSerializer.Serialize(new
        {
            id = "evt_usr_created_2",
            type = "user.created",
            data = new
            {
                id = externalUserId,
                first_name = "RealFirst",
                last_name = "RealLast",
                email_addresses = new[]
                {
                    new { id = "email_2", email_address = userEmail }
                },
                primary_email_address_id = "email_2",
                public_metadata = new
                {
                    tenantId = tenantId.ToString(),
                    invitationType = "tenant_member"
                }
            }
        });

        var record = new WebhookInboxRecord
        {
            SvixMessageId = "msg_usr_created_2",
            ProviderEventId = "evt_usr_created_2",
            EventType = "user.created",
            PayloadJson = payload,
            Status = WebhookProcessingStatus.Pending
        };
        dbContext.WebhookInbox!.Add(record);
        await dbContext.SaveChangesAsync();

        var success = await inboxService.ProcessSingleRecordAsync(record.Id);

        success.Should().BeTrue();

        var member = await dbContext.TenantMembers!
            .FirstOrDefaultAsync(m => m.TenantId == tenantId && m.Email == userEmail);

        member.Should().NotBeNull();
        member!.ExternalIdentityId.Should().Be(externalUserId);
        member.Status.Should().Be(Status.Active);
        member.FirstName.Should().Be("RealFirst");
        member.LastName.Should().Be("RealLast");
        member.InvitationTokenHash.Should().BeNull();
        member.InvitationExpiresAtUtc.Should().BeNull();
    }

    [Fact]
    public async Task ProcessSingleRecordAsync_WhenUserUpdated_UpdatesMemberNames()
    {
        var tenantId = Guid.NewGuid();
        var externalUserId = "user_clerk_updated_789";

        dbContext.TenantMembers!.Add(new TenantMember
        {
            TenantId = tenantId,
            Provider = IdentityProvider.Clerk,
            ExternalIdentityId = externalUserId,
            Email = "update_me@company.org",
            FirstName = "OldFirst",
            LastName = "OldLast",
            Status = Status.Active
        });
        await dbContext.SaveChangesAsync();

        var payload = JsonSerializer.Serialize(new
        {
            id = "evt_usr_updated_1",
            type = "user.updated",
            data = new
            {
                id = externalUserId,
                first_name = "NewFirst",
                last_name = "NewLast"
            }
        });

        var record = new WebhookInboxRecord
        {
            SvixMessageId = "msg_usr_updated_1",
            ProviderEventId = "evt_usr_updated_1",
            EventType = "user.updated",
            PayloadJson = payload,
            Status = WebhookProcessingStatus.Pending
        };
        dbContext.WebhookInbox!.Add(record);
        await dbContext.SaveChangesAsync();

        var success = await inboxService.ProcessSingleRecordAsync(record.Id);

        success.Should().BeTrue();

        var member = await dbContext.TenantMembers!
            .FirstAsync(m => m.ExternalIdentityId == externalUserId);

        member.FirstName.Should().Be("NewFirst");
        member.LastName.Should().Be("NewLast");
    }

    [Fact]
    public async Task ProcessSingleRecordAsync_WhenUserDeleted_DeactivatesMember()
    {
        var tenantId = Guid.NewGuid();
        var externalUserId = "user_clerk_deleted_999";

        dbContext.TenantMembers!.Add(new TenantMember
        {
            TenantId = tenantId,
            Provider = IdentityProvider.Clerk,
            ExternalIdentityId = externalUserId,
            Email = "del_me@company.org",
            Status = Status.Active
        });
        await dbContext.SaveChangesAsync();

        var payload = JsonSerializer.Serialize(new
        {
            id = "evt_usr_deleted_1",
            type = "user.deleted",
            data = new
            {
                id = externalUserId
            }
        });

        var record = new WebhookInboxRecord
        {
            SvixMessageId = "msg_usr_deleted_1",
            ProviderEventId = "evt_usr_deleted_1",
            EventType = "user.deleted",
            PayloadJson = payload,
            Status = WebhookProcessingStatus.Pending
        };
        dbContext.WebhookInbox!.Add(record);
        await dbContext.SaveChangesAsync();

        var success = await inboxService.ProcessSingleRecordAsync(record.Id);

        success.Should().BeTrue();

        var member = await dbContext.TenantMembers!
            .FirstAsync(m => m.ExternalIdentityId == externalUserId);

        member.Status.Should().Be(Status.Inactive);
    }
}
