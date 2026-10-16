using System.Security.Claims;
using ERPEZ.Domain.Entities.AMS;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Infrastructure.Middlewares;
using ERPEZ.Infrastructure.Persistence;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Interfaces;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Dashboard.Application.UnitTests.Middlewares;

public class KeycloakUserProvisioningMiddlewareTests
{
    private readonly Mock<IUserAuthorizationService> authServiceMock = new();
    private readonly Mock<ILogger<KeycloakUserProvisioningMiddleware>> loggerMock = new();
    private readonly Mock<ITenantContextService> tenantContextMock = new();

    private static DbContextOptions<ApplicationDbContext> CreateOptions(string? dbName = null)
    {
        return new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: dbName ?? Guid.NewGuid().ToString())
            .Options;
    }

    private HttpContext CreateHttpContext(
        Func<ApplicationDbContext> dbContextFactory,
        ClaimsPrincipal? user = null,
        Dictionary<string, string?>? configValues = null,
        Action<HeaderDictionary>? configureHeaders = null)
    {
        var context = new DefaultHttpContext();
        if (user != null)
        {
            context.User = user;
        }

        configureHeaders?.Invoke((HeaderDictionary)context.Request.Headers);

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(configValues ?? new Dictionary<string, string?>())
            .Build();

        var services = new ServiceCollection();
        services.AddScoped(_ => dbContextFactory());
        services.AddSingleton(loggerMock.Object);
        services.AddSingleton(authServiceMock.Object);
        services.AddSingleton(tenantContextMock.Object);
        services.AddSingleton<IConfiguration>(config);

        context.RequestServices = services.BuildServiceProvider();
        return context;
    }

    [Fact]
    public async Task InvokeAsync_WhenUserIsUnauthenticated_PassesThroughWithoutTouchingDb()
    {
        // Arrange
        var options = CreateOptions();
        var context = CreateHttpContext(
            () => new ApplicationDbContext(options), 
            user: new ClaimsPrincipal(new ClaimsIdentity()));

        var nextInvoked = false;
        var middleware = new KeycloakUserProvisioningMiddleware(_ =>
        {
            nextInvoked = true;
            return Task.CompletedTask;
        });

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        nextInvoked.Should().BeTrue();
        using var verifyContext = new ApplicationDbContext(options);
        (await verifyContext.Users!.CountAsync()).Should().Be(0);
        authServiceMock.Verify(a => a.InvalidateUserPermissions(It.IsAny<string>(), It.IsAny<Guid?>()), Times.Never);
    }

    [Fact]
    public async Task InvokeAsync_WhenUserIsNew_ProvisionsUserAndAssignsDefaultRole()
    {
        // Arrange
        var options = CreateOptions();
        var defaultRole = new AmsRole
        {
            Id = Guid.NewGuid(),
            Name = RoleConstants.EmployeeViewer,
            IsActive = true
        };

        using (var seedContext = new ApplicationDbContext(options))
        {
            await seedContext.AmsRoles!.AddAsync(defaultRole);
            await seedContext.SaveChangesAsync();
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "clerk|user_new_123"),
            new Claim(ClaimTypes.Email, "newuser@example.com"),
            new Claim(ClaimTypes.GivenName, "Juan"),
            new Claim(ClaimTypes.Surname, "Dela Cruz")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        var context = CreateHttpContext(() => new ApplicationDbContext(options), user: principal);
        var nextInvoked = false;
        var middleware = new KeycloakUserProvisioningMiddleware(_ =>
        {
            nextInvoked = true;
            return Task.CompletedTask;
        });

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        nextInvoked.Should().BeTrue();
        using var verifyContext = new ApplicationDbContext(options);
        var provisionedUser = await verifyContext.Users!.FirstOrDefaultAsync(u => u.ExternalIdentityId == "clerk|user_new_123");
        provisionedUser.Should().NotBeNull();
        provisionedUser!.Email.Should().Be("newuser@example.com");
        provisionedUser.FirstName.Should().Be("Juan");
        provisionedUser.LastName.Should().Be("Dela Cruz");
        provisionedUser.IsActive.Should().BeTrue();

        var assignment = await verifyContext.UserRoleAssignments!.FirstOrDefaultAsync(ura => ura.UserId == provisionedUser.Id);
        assignment.Should().NotBeNull();
        assignment!.RoleId.Should().Be(defaultRole.Id);

        authServiceMock.Verify(a => a.InvalidateUserPermissions("clerk|user_new_123", null), Times.Once);
    }

    [Fact]
    public async Task InvokeAsync_WhenUserAlreadyExists_DoesNotDuplicateUser()
    {
        // Arrange
        var options = CreateOptions();
        var existingUser = new User
        {
            Id = Guid.NewGuid(),
            ExternalIdentityId = "clerk|user_existing",
            Username = "existing@example.com",
            Email = "existing@example.com",
            FirstName = "Maria",
            LastName = "Clara",
            IsActive = true
        };

        using (var seedContext = new ApplicationDbContext(options))
        {
            await seedContext.Users!.AddAsync(existingUser);
            await seedContext.SaveChangesAsync();
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "clerk|user_existing"),
            new Claim(ClaimTypes.Email, "existing@example.com")
        };
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));
        var context = CreateHttpContext(() => new ApplicationDbContext(options), user: principal);

        var nextInvoked = false;
        var middleware = new KeycloakUserProvisioningMiddleware(_ =>
        {
            nextInvoked = true;
            return Task.CompletedTask;
        });

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        nextInvoked.Should().BeTrue();
        using var verifyContext = new ApplicationDbContext(options);
        (await verifyContext.Users!.CountAsync()).Should().Be(1);
    }

    [Fact]
    public async Task InvokeAsync_WhenDuplicateKeyRaceConditionOccurs_CatchesExceptionAndProceeds()
    {
        // Arrange
        var options = CreateOptions();
        using (var seedContext = new ApplicationDbContext(options))
        {
            await seedContext.AmsRoles!.AddAsync(new AmsRole
            {
                Id = Guid.NewGuid(),
                Name = RoleConstants.EmployeeViewer,
                IsActive = true
            });
            await seedContext.SaveChangesAsync();
        }

        var failureMessage = "23505: duplicate key value violates unique constraint \"IX_Users_ExternalIdentityId\"";
        var context = CreateHttpContext(
            () => new DuplicateKeyThrowingDbContext(options, failureMessage) { ShouldThrowOnUserAdd = true },
            user: new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "clerk|concurrent_user"),
                new Claim(ClaimTypes.Email, "concurrent@example.com")
            }, "TestAuth")));

        var nextInvoked = false;
        var middleware = new KeycloakUserProvisioningMiddleware(_ =>
        {
            nextInvoked = true;
            return Task.CompletedTask;
        });

        // Act & Assert: InvokeAsync catches the duplicate key race condition (23505) and lets pipeline proceed
        var act = async () => await middleware.InvokeAsync(context);
        await act.Should().NotThrowAsync();
        nextInvoked.Should().BeTrue();
    }

    [Fact]
    public async Task InvokeAsync_WhenNonDuplicateKeyExceptionOccurs_BubblesUp()
    {
        // Arrange
        var options = CreateOptions();
        using (var seedContext = new ApplicationDbContext(options))
        {
            await seedContext.AmsRoles!.AddAsync(new AmsRole
            {
                Id = Guid.NewGuid(),
                Name = RoleConstants.EmployeeViewer,
                IsActive = true
            });
            await seedContext.SaveChangesAsync();
        }

        var failureMessage = "Fatal I/O error writing to disk";
        var context = CreateHttpContext(
            () => new DuplicateKeyThrowingDbContext(options, failureMessage) { ShouldThrowOnUserAdd = true },
            user: new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "clerk|failing_user"),
                new Claim(ClaimTypes.Email, "failing@example.com")
            }, "TestAuth")));

        var middleware = new KeycloakUserProvisioningMiddleware(_ => Task.CompletedTask);

        // Act & Assert: Non-race condition database exceptions must bubble up to prevent silent failures
        var act = async () => await middleware.InvokeAsync(context);
        await act.Should().ThrowAsync<DbUpdateException>();
    }

    [Fact]
    public async Task InvokeAsync_WhenClientSendsAdminHeaderWithoutValidClaim_DoesNotEscalatePrivilege()
    {
        // Arrange
        var options = CreateOptions();
        var employeeRole = new AmsRole
        {
            Id = Guid.NewGuid(),
            Name = RoleConstants.EmployeeViewer,
            IsActive = true
        };
        var adminRole = new AmsRole
        {
            Id = Guid.NewGuid(),
            Name = RoleConstants.SystemAdministrator,
            IsActive = true
        };

        using (var seedContext = new ApplicationDbContext(options))
        {
            await seedContext.AmsRoles!.AddRangeAsync(employeeRole, adminRole);
            await seedContext.SaveChangesAsync();
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "clerk|regular_user"),
            new Claim(ClaimTypes.Email, "regular@example.com")
        };
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));

        // Caller attempts to spoof administrative operating role via header
        var context = CreateHttpContext(
            () => new ApplicationDbContext(options), 
            user: principal, 
            configureHeaders: headers =>
            {
                headers["X-Operating-Role"] = RoleConstants.SystemAdministrator;
            });

        var middleware = new KeycloakUserProvisioningMiddleware(_ => Task.CompletedTask);

        // Act
        await middleware.InvokeAsync(context);

        // Assert: User should be provisioned with default EmployeeViewer role, NOT SystemAdministrator
        using var verifyContext = new ApplicationDbContext(options);
        var user = await verifyContext.Users!.FirstOrDefaultAsync(u => u.ExternalIdentityId == "clerk|regular_user");
        user.Should().NotBeNull();

        var assignment = await verifyContext.UserRoleAssignments!.FirstOrDefaultAsync(ura => ura.UserId == user!.Id);
        assignment.Should().NotBeNull();
        assignment!.RoleId.Should().Be(employeeRole.Id);
        assignment.RoleId.Should().NotBe(adminRole.Id);
    }

    private class DuplicateKeyThrowingDbContext(DbContextOptions<ApplicationDbContext> options, string failureMessage) 
        : ApplicationDbContext(options)
    {
        public bool ShouldThrowOnUserAdd { get; set; } = true;

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            if (ShouldThrowOnUserAdd && ChangeTracker.Entries<User>().Any(e => e.State == EntityState.Added))
            {
                throw new DbUpdateException(failureMessage, new Exception(failureMessage));
            }
            return base.SaveChangesAsync(cancellationToken);
        }
    }
}
