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
}
