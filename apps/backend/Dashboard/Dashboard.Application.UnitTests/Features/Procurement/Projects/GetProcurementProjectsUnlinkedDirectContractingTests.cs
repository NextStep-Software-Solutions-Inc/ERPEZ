using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Dashboard.Application.UnitTests.Features.Procurement.PurchaseOrders;
using ERPEZ.Application.Features.Procurement.Projects.Queries.GetProcurementProjects;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Sieve.Models;
using Sieve.Services;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.Projects;

public class GetProcurementProjectsUnlinkedDirectContractingTests
{
    private static ISieveProcessor CreateSieveProcessor()
    {
        var services = new ServiceCollection();
        services.AddScoped<ISieveProcessor, SieveProcessor>();
        services.AddSingleton<IOptions<SieveOptions>>(new TestSieveOptionsAccessor());
        var sp = services.BuildServiceProvider();
        return sp.GetRequiredService<ISieveProcessor>();
    }

    [Fact]
    public async Task Handle_WhenUnlinkedDirectContractingIsTrue_FiltersOutLinkedAndZeroAbcProjects()
    {
        // Arrange
        using var context = PurchaseOrderTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = PurchaseOrderTestHelpers.CreateUnitOfWork(context);
        var sieveProcessor = CreateSieveProcessor();
        var handler = new GetProcurementProjectsQueryHandler(unitOfWork, sieveProcessor);

        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Name = "Exclusive Supplier",
            Status = "Approved"
        };
        await unitOfWork.SupplierRepository.AddAsync(supplier);

        // 1. Eligible project: Unlinked with ABC > 0 (Should be included)
        var unlinkedProject = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Unlinked BAC Project",
            ABC = 500000m,
            Status = "Approved"
        };
        await unitOfWork.ProcurementProjectRepository.AddAsync(unlinkedProject);

        // 2. Ineligible project: Already linked to active Direct Contracting (Should be excluded)
        var linkedProject = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Linked BAC Project",
            ABC = 300000m,
            Status = "Approved"
        };
        await unitOfWork.ProcurementProjectRepository.AddAsync(linkedProject);

        var activeDC = new DirectContracting
        {
            Id = Guid.NewGuid(),
            DCNumber = "DC-2026-0001",
            Name = "Active Direct Contracting",
            BACProjectId = linkedProject.Id,
            ExclusiveSupplierId = supplier.Id,
            TotalABC = 300000m,
            IsDeleted = false
        };
        await unitOfWork.DirectContractingRepository.AddAsync(activeDC);

        // 3. Eligible project: Linked to a deleted Direct Contracting (Should be included)
        var deletedLinkProject = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Project with Deleted DC",
            ABC = 200000m,
            Status = "Approved"
        };
        await unitOfWork.ProcurementProjectRepository.AddAsync(deletedLinkProject);

        var deletedDC = new DirectContracting
        {
            Id = Guid.NewGuid(),
            DCNumber = "DC-2026-0002",
            Name = "Deleted Direct Contracting",
            BACProjectId = deletedLinkProject.Id,
            ExclusiveSupplierId = supplier.Id,
            TotalABC = 200000m,
            IsDeleted = true
        };
        await unitOfWork.DirectContractingRepository.AddAsync(deletedDC);

        // 4. Ineligible project: Zero ABC (Should be excluded)
        var zeroAbcProject = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Zero ABC Project",
            ABC = 0m,
            Status = "Approved"
        };
        await unitOfWork.ProcurementProjectRepository.AddAsync(zeroAbcProject);

        // 5. Ineligible project: Deleted project (Should be excluded)
        var deletedProject = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Deleted Project",
            ABC = 100000m,
            Status = "Approved",
            IsDeleted = true
        };
        await unitOfWork.ProcurementProjectRepository.AddAsync(deletedProject);

        await unitOfWork.SaveChangesAsync();

        // Act
        var query = new GetProcurementProjectsQuery
        {
            UnlinkedDirectContracting = true,
            PageSize = 50,
            PageNumber = 1
        };
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Data.Should().NotBeNull();
        result.Data!.Should().HaveCount(2);
        result.Data!.Select(p => p.Id).Should().Contain(unlinkedProject.Id);
        result.Data!.Select(p => p.Id).Should().Contain(deletedLinkProject.Id);
        result.Data!.Select(p => p.Id).Should().NotContain(linkedProject.Id);
        result.Data!.Select(p => p.Id).Should().NotContain(zeroAbcProject.Id);
        result.Data!.Select(p => p.Id).Should().NotContain(deletedProject.Id);
    }
}
