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

namespace Dashboard.Application.UnitTests.Features.Procurement.NoticeToProceeds;

public class TestSieveOptionsAccessor : IOptions<SieveOptions>
{
    public SieveOptions Value => new();
}

public static class NoticeToProceedTestHelpers
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

    public static ISieveProcessor CreateSieveProcessor()
    {
        var services = new ServiceCollection();
        services.AddScoped<ISieveProcessor, SieveProcessor>();
        services.AddSingleton<IOptions<SieveOptions>>(new TestSieveOptionsAccessor());
        var serviceProvider = services.BuildServiceProvider();
        return serviceProvider.GetRequiredService<ISieveProcessor>();
    }

    public static ERPEZ.Application.Interfaces.ICurrentUserService CreateCurrentUserService(
        string userId = "00000000-0000-0000-0000-000000000001",
        string username = "testuser",
        string name = "Jane Procurement Officer")
    {
        var mock = new Moq.Mock<ERPEZ.Application.Interfaces.ICurrentUserService>();
        mock.Setup(m => m.UserId).Returns(userId);
        mock.Setup(m => m.Username).Returns(username);
        mock.Setup(m => m.Name).Returns(name);
        mock.Setup(m => m.Email).Returns("jane@example.gov.ph");
        mock.Setup(m => m.IsAuthenticated).Returns(true);
        return mock.Object;
    }

    public static async Task<(Contract Contract, NoticeOfAward Noa, Supplier Supplier, ProcurementProject Project)> SeedApprovedContractAsync(
        ApplicationDbContext context,
        ContractStatus contractStatus = ContractStatus.Approved,
        decimal awardedAmount = 850000m)
    {
        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Name = "Mega Office Solutions Inc.",
            Address = "456 Commerce Avenue, Makati City",
            ContactPerson = "Maria Santos",
            Email = "maria@megaoffice.ph",
            ContactNumber = "+63 918 765 4321"
        };
        context.Suppliers?.Add(supplier);

        var project = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Supply and Delivery of Advanced Ergonomic Workstations",
            ABC = 1000000m
        };
        context.ProcurementProjects?.Add(project);

        var bacRes = new BACResolution
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = project.Id,
            ResolutionNumber = "BAC-RES-2026-101",
            Status = "Approved"
        };
        context.BACResolutions?.Add(bacRes);

        var noa = new NoticeOfAward
        {
            Id = Guid.NewGuid(),
            NOANumber = "NOA-2026-009",
            SupplierId = supplier.Id,
            ProcurementProjectId = project.Id,
            BACResolutionId = bacRes.Id,
            AwardedAmount = awardedAmount,
            Status = NoticeOfAwardStatus.Approved,
            NOADate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-5)),
            BidDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-15)),
            Description = "Award for Ergonomic Workstations",
            ProcurementType = NoticeOfAwardType.GoodsAndServices,
            IssuedAt = DateTime.UtcNow.AddDays(-5),
            CreatedAt = DateTime.UtcNow.AddDays(-5),
            CreatedBy = "BAC Secretariat"
        };
        context.NoticeOfAwards?.Add(noa);

        var contract = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = "CONTRACT-2026-009",
            NoticeOfAwardId = noa.Id,
            Status = contractStatus,
            ContractDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-2)),
            ApprovedAt = DateTime.UtcNow.AddDays(-1),
            ApprovedByName = "Head of the Procuring Entity (HoPE)",
            ContractApprovedAt = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)),
            ExecutedAt = contractStatus == ContractStatus.Executed ? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)) : null,
            ExecutedByName = contractStatus == ContractStatus.Executed ? "Contract Administrator" : null,
            Description = "Formal Contract for Ergonomic Workstations",
            CreatedAt = DateTime.UtcNow.AddDays(-2),
            CreatedBy = "Procurement Staff"
        };
        context.Contracts?.Add(contract);

        await context.SaveChangesAsync();

        return (contract, noa, supplier, project);
    }
}
