using System;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Sieve.Models;
using Sieve.Services;

namespace Dashboard.Application.UnitTests.Features.Procurement.Contracts;

public class TestSieveOptionsAccessor : IOptions<SieveOptions>
{
    public SieveOptions Value => new();
}

public static class ContractTestHelpers
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

    public static ERPEZ.Application.Interfaces.ICurrentUserService CreateCurrentUserService(
        string userId = "00000000-0000-0000-0000-000000000001",
        string username = "testuser",
        string name = "Test User")
    {
        var mock = new Moq.Mock<ERPEZ.Application.Interfaces.ICurrentUserService>();
        mock.Setup(m => m.UserId).Returns(userId);
        mock.Setup(m => m.Username).Returns(username);
        mock.Setup(m => m.Name).Returns(name);
        mock.Setup(m => m.Email).Returns("test@example.com");
        mock.Setup(m => m.IsAuthenticated).Returns(true);
        return mock.Object;
    }

    public static async Task<(NoticeOfAward Noa, Supplier Supplier, ProcurementProject Project)> SeedApprovedNoaAsync(
        ApplicationDbContext context,
        NoticeOfAwardStatus status = NoticeOfAwardStatus.Approved,
        decimal awardedAmount = 850000m)
    {
        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Name = "Acme Technologies Inc.",
            Address = "123 Technology Way, Cyber City",
            ContactPerson = "John Doe",
            Email = "john.doe@acme.com",
            ContactNumber = "+63 917 123 4567"
        };
        context.Suppliers?.Add(supplier);

        var project = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "IT Infrastructure & Server Upgrade",
            ABC = 1000000m
        };
        context.ProcurementProjects?.Add(project);

        var bacRes = new BACResolution
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = project.Id,
            ResolutionNumber = "BAC-RES-2026-088",
            Status = "Approved"
        };
        context.BACResolutions?.Add(bacRes);

        var noa = new NoticeOfAward
        {
            Id = Guid.NewGuid(),
            NOANumber = "NOA-2026-005",
            SupplierId = supplier.Id,
            ProcurementProjectId = project.Id,
            BACResolutionId = bacRes.Id,
            AwardedAmount = awardedAmount,
            Status = status,
            NOADate = new DateOnly(2026, 6, 15),
            BidDate = new DateOnly(2026, 6, 1),
            Description = "Award for IT Infrastructure & Server Upgrade",
            ProcurementType = NoticeOfAwardType.GoodsAndServices,
            IssuedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "BAC Secretariat"
        };
        context.NoticeOfAwards?.Add(noa);

        await context.SaveChangesAsync();

        return (noa, supplier, project);
    }
}
