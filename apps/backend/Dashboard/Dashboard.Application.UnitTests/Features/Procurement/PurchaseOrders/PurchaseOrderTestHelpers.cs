using System;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Sieve.Models;
using Sieve.Services;

namespace Dashboard.Application.UnitTests.Features.Procurement.PurchaseOrders;

public class TestSieveOptionsAccessor : IOptions<SieveOptions>
{
    public SieveOptions Value => new();
}

public static class PurchaseOrderTestHelpers
{
    public static ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    public static IUnitOfWork CreateUnitOfWork(ApplicationDbContext context)
    {
        var services = new ServiceCollection();
        services.AddScoped<ISieveProcessor, SieveProcessor>();
        services.AddSingleton<IOptions<SieveOptions>>(new TestSieveOptionsAccessor());
        var serviceProvider = services.BuildServiceProvider();
        return new UnitOfWork(context, serviceProvider);
    }

    public static ERPEZ.Application.Interfaces.ICurrentUserService CreateCurrentUserService(string userId = "00000000-0000-0000-0000-000000000001")
    {
        var mock = new Moq.Mock<ERPEZ.Application.Interfaces.ICurrentUserService>();
        mock.Setup(c => c.UserId).Returns(userId);
        return mock.Object;
    }
}
