using ERPEZ.Application.Common.Sieve;
using ERPEZ.Application.Features.Planning.Object.Queries.GetObjects;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Sieve.Models;
using Sieve.Services;
using Xunit;

namespace Dashboard.Application.UnitTests;

public class ObjectSieveTests
{
    private class SieveOptionsAccessor : IOptions<SieveOptions>
    {
        public SieveOptions Value => new SieveOptions();
    }

    private static ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    private static IUnitOfWork CreateUnitOfWork(ApplicationDbContext context)
    {
        var services = new ServiceCollection();
        services.AddScoped<ISieveProcessor, ApplicationSieveProcessor>();
        services.AddSingleton<IOptions<SieveOptions>>(new SieveOptionsAccessor());
        var serviceProvider = services.BuildServiceProvider();
        return new UnitOfWork(context, serviceProvider);
    }

    [Fact]
    public async Task GetObjects_WithSearchFilter_ShouldFilterByNameOrCode()
    {
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var obj1 = new ERPEZ.Domain.Entities.Planning.Object
        {
            Id = Guid.NewGuid(),
            Code = "5020101000",
            Name = "Traveling Expenses - Local",
            IsActive = true
        };
        var obj2 = new ERPEZ.Domain.Entities.Planning.Object
        {
            Id = Guid.NewGuid(),
            Code = "5010101000",
            Name = "Salaries and Wages - Regular",
            IsActive = true
        };
        var obj3 = new ERPEZ.Domain.Entities.Planning.Object
        {
            Id = Guid.NewGuid(),
            Code = "1010101000",
            Name = "Cash Collecting Officers",
            IsActive = true
        };

        await context.Objects.AddRangeAsync(obj1, obj2, obj3);
        await context.SaveChangesAsync();

        var handler = new GetObjectsQueryHandler(unitOfWork);

        // Test 1: Cross-property OR by Code
        var result1 = await handler.Handle(new GetObjectsQuery
        {
            PageNumber = 1,
            PageSize = 10,
            Filters = "Name@=*502|Code@=*502"
        }, CancellationToken.None);

        result1.Data.Should().NotBeNull();
        result1.Data!.Should().HaveCount(1);
        result1.Data!.First().Code.Should().Be("5020101000");

        // Test 2: Cross-property OR by Name
        var result2 = await handler.Handle(new GetObjectsQuery
        {
            PageNumber = 1,
            PageSize = 10,
            Filters = "Name@=*travel|Code@=*travel"
        }, CancellationToken.None);

        result2.Data.Should().NotBeNull();
        result2.Data!.Should().HaveCount(1);
        result2.Data!.First().Name.Should().Be("Traveling Expenses - Local");

        // Test 3: Cross-property OR with FiscalYearId AND condition
        var fyId = Guid.NewGuid();
        obj1.FiscalYearId = fyId;
        await context.SaveChangesAsync();

        var result3Match = await handler.Handle(new GetObjectsQuery
        {
            PageNumber = 1,
            PageSize = 10,
            Filters = "Name@=*502|Code@=*502",
            FiscalYearId = fyId
        }, CancellationToken.None);

        result3Match.Data.Should().NotBeNull();
        result3Match.Data!.Should().HaveCount(1);

        var result3NoMatch = await handler.Handle(new GetObjectsQuery
        {
            PageNumber = 1,
            PageSize = 10,
            Filters = "Name@=*502|Code@=*502",
            FiscalYearId = Guid.NewGuid() // different FY
        }, CancellationToken.None);

        result3NoMatch.Data.Should().NotBeNull();
        result3NoMatch.Data!.Should().HaveCount(0);
    }
}
