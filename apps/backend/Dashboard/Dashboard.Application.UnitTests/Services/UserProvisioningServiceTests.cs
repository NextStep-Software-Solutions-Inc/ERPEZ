using ERPEZ.Application.Common.Dtos.AMS;
using ERPEZ.Domain.Entities.AMS;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Infrastructure.Persistence;
using ERPEZ.Infrastructure.Services;
using ERPEZ.Shared.Interfaces;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Dashboard.Application.UnitTests.Services;

public class UserProvisioningServiceTests
{
    private readonly Mock<IUserAuthorizationService> authServiceMock = new();
    private readonly Mock<ILogger<UserProvisioningService>> loggerMock = new();

    private static ApplicationDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    private UserProvisioningService CreateService(ApplicationDbContext dbContext)
    {
        return new UserProvisioningService(dbContext, authServiceMock.Object, loggerMock.Object);
    }

    [Fact]
    public async Task GetOrProvisionUserAsync_WhenUserExistsByUserId_ReturnsExistingUser()
    {
        // Arrange
        using var dbContext = CreateDbContext();
        var existingUserId = Guid.NewGuid();
        var existingUser = new User
        {
            Id = existingUserId,
            ExternalIdentityId = "auth0|existing123",
            Username = "existing@example.com",
            Email = "existing@example.com",
            FirstName = "Juan",
            LastName = "Dela Cruz",
            IsActive = true
        };
        await dbContext.Users!.AddAsync(existingUser);
        await dbContext.SaveChangesAsync();

        var service = CreateService(dbContext);
        var request = new AssignUserRolesDto
        {
            UserId = existingUserId,
            Email = "newemail@example.com"
        };

        // Act
        var result = await service.GetOrProvisionUserAsync(request, "AdminTester");

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(existingUserId);
        result.Email.Should().Be("existing@example.com");
    }

    [Fact]
    public async Task GetOrProvisionUserAsync_WhenUserExistsByExternalIdentityId_ReturnsExistingUser()
    {
        // Arrange
        using var dbContext = CreateDbContext();
        var externalId = "clerk|user_999";
        var existingUser = new User
        {
            Id = Guid.NewGuid(),
            ExternalIdentityId = externalId,
            Username = "clerkuser@example.com",
            Email = "clerkuser@example.com",
            FirstName = "Maria",
            LastName = "Clara",
            IsActive = true
        };
        await dbContext.Users!.AddAsync(existingUser);
        await dbContext.SaveChangesAsync();

        var service = CreateService(dbContext);
        var request = new AssignUserRolesDto
        {
            ExternalIdentityId = externalId
        };

        // Act
        var result = await service.GetOrProvisionUserAsync(request, "AdminTester");

        // Assert
        result.Should().NotBeNull();
        result!.ExternalIdentityId.Should().Be(externalId);
        result.LastName.Should().Be("Clara");
    }

    [Fact]
    public async Task GetOrProvisionUserAsync_WhenUserDoesNotExist_AutoProvisionsNewUser()
    {
        // Arrange
        using var dbContext = CreateDbContext();
        var service = CreateService(dbContext);
        var externalId = "auth0|new_user_456";
        var request = new AssignUserRolesDto
        {
            ExternalIdentityId = externalId,
            Email = "newbie@government.gov.ph",
            FullName = "Crisostomo Ibarra"
        };

        // Act
        var result = await service.GetOrProvisionUserAsync(request, "AdminTester");

        // Assert
        result.Should().NotBeNull();
        result!.ExternalIdentityId.Should().Be(externalId);
        result.Email.Should().Be("newbie@government.gov.ph");
        result.FirstName.Should().Be("Crisostomo");
        result.LastName.Should().Be("Ibarra");
        result.CreatedBy.Should().Be("AdminTester");

        // Verify persisted in DB
        var savedInDb = await dbContext.Users!.FirstOrDefaultAsync(u => u.ExternalIdentityId == externalId);
        savedInDb.Should().NotBeNull();
        savedInDb!.Email.Should().Be("newbie@government.gov.ph");
    }

    [Fact]
    public async Task GetOrProvisionUserAsync_WhenUserDoesNotExistAndDetailsMissing_ReturnsNull()
    {
        // Arrange
        using var dbContext = CreateDbContext();
        var service = CreateService(dbContext);
        var request = new AssignUserRolesDto
        {
            ExternalIdentityId = "unknown|999",
            Email = null,
            FullName = null
        };

        // Act
        var result = await service.GetOrProvisionUserAsync(request, "AdminTester");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task AssignUserRolesAsync_WhenUserNotFoundAndCannotProvision_ReturnsFailure()
    {
        // Arrange
        using var dbContext = CreateDbContext();
        var service = CreateService(dbContext);
        var request = new AssignUserRolesDto
        {
            ExternalIdentityId = "unknown|none",
            Email = "",
            FullName = ""
        };

        // Act
        var (success, errorMessage) = await service.AssignUserRolesAsync(request, "AdminTester");

        // Assert
        success.Should().BeFalse();
        errorMessage.Should().Contain("User not found and insufficient details");
    }

    [Fact]
    public async Task AssignUserRolesAsync_WithValidRoles_ReplacesPreviousRolesAndInvalidatesCache()
    {
        // Arrange
        using var dbContext = CreateDbContext();
        var role1 = new AmsRole { Id = Guid.NewGuid(), Name = "Budget Officer", IsActive = true };
        var role2 = new AmsRole { Id = Guid.NewGuid(), Name = "Procurement Head", IsActive = true };
        var role3 = new AmsRole { Id = Guid.NewGuid(), Name = "Deleted Role", IsActive = false, IsDeleted = true };
        await dbContext.AmsRoles!.AddRangeAsync(role1, role2, role3);

        var userId = Guid.NewGuid();
        var externalId = "clerk|user_assigned";
        var existingUser = new User
        {
            Id = userId,
            ExternalIdentityId = externalId,
            Username = "officer@example.com",
            Email = "officer@example.com",
            FirstName = "Pedro",
            LastName = "Penduko",
            IsActive = true
        };
        await dbContext.Users!.AddAsync(existingUser);

        // Existing old role assignment
        var oldRoleAssignment = new UserRoleAssignment
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            RoleId = Guid.NewGuid()
        };
        await dbContext.UserRoleAssignments!.AddAsync(oldRoleAssignment);
        await dbContext.SaveChangesAsync();

        var service = CreateService(dbContext);
        var request = new AssignUserRolesDto
        {
            UserId = userId,
            ExternalIdentityId = externalId,
            RoleIds = [role1.Id, role2.Id, role3.Id] // role3 is inactive/deleted so should be ignored
        };

        // Act
        var (success, errorMessage) = await service.AssignUserRolesAsync(request, "SuperAdmin");

        // Assert
        success.Should().BeTrue();
        errorMessage.Should().BeNull();

        // Verify old role assignment was removed and only active roles added
        var currentAssignments = await dbContext.UserRoleAssignments!
            .Where(ura => ura.UserId == userId)
            .ToListAsync();

        currentAssignments.Should().HaveCount(2);
        currentAssignments.Select(a => a.RoleId).Should().BeEquivalentTo(new[] { role1.Id, role2.Id });

        // Verify permission cache invalidated
        authServiceMock.Verify(a => a.InvalidateUserPermissions(externalId, null), Times.Once);
    }
}
