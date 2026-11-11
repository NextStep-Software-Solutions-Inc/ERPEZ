using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.GenerateRFQDocument;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Application.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Persistence;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Sieve.Models;
using Sieve.Services;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.RequestForQuotation;

public class TestSieveOptionsAccessor : IOptions<SieveOptions>
{
    public SieveOptions Value => new();
}

public class GenerateRFQDocumentAuthorizationTests
{
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
        services.AddScoped<ISieveProcessor, SieveProcessor>();
        services.AddSingleton<IOptions<SieveOptions>>(new TestSieveOptionsAccessor());
        var serviceProvider = services.BuildServiceProvider();
        return new UnitOfWork(context, serviceProvider);
    }

    private static (
        Mock<IDocumentRendererService> rendererMock,
        Mock<IDocumentStorageService> storageMock,
        Mock<IRFQDocumentContextService> contextServiceMock,
        Mock<ILogger<GenerateRFQDocumentCommandHandler>> loggerMock)
        CreateMocks()
    {
        var rendererMock = new Mock<IDocumentRendererService>();
        rendererMock.Setup(r => r.RenderAsync(It.IsAny<RfqDataDto>(), DocumentType.Rfq, It.IsAny<ExportFormat>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([0x25, 0x50, 0x44, 0x46]);

        var storageMock = new Mock<IDocumentStorageService>();
        storageMock.Setup(s => s.SaveAsync(It.IsAny<byte[]>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("documents/rfq/test.pdf");

        var contextServiceMock = new Mock<IRFQDocumentContextService>();
        contextServiceMock.Setup(c => c.ResolveAsync(It.IsAny<string>(), It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new RFQDocumentContext
            {
                ProcuringEntity = "Test Procuring Entity",
                ProcuringEntityAddress = "123 Test St",
                SubmissionLocation = "BAC Office",
                DeliveryLocation = "Warehouse",
                ContactEmail = "bac@test.gov.ph",
                ContactPhone = "123-4567",
                BacChairpersonName = "Hon. BAC Chair",
                BacChairpersonTitle = "Chairperson",
                BacSecName = "BAC Secretariat"
            });

        var loggerMock = new Mock<ILogger<GenerateRFQDocumentCommandHandler>>();

        return (rendererMock, storageMock, contextServiceMock, loggerMock);
    }

    [Fact]
    public async Task GenerateRFQDocument_BlankGenericTemplate_ShouldSucceedForPublicCaller()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var office = new Office { Id = Guid.NewGuid(), Name = "General Services Office" };
        context.Offices?.Add(office);

        var rfq = new ERPEZ.Domain.Entities.Procurement.RFQ
        {
            Id = Guid.NewGuid(),
            RFQNumber = "RFQ-2026-001",
            Status = StatusEnum.Approved
        };
        context.RFQs?.Add(rfq);
        await context.SaveChangesAsync();

        var (rendererMock, storageMock, contextServiceMock, loggerMock) = CreateMocks();

        var currentUserMock = new Mock<ICurrentUserService>();
        currentUserMock.Setup(u => u.IsAuthenticated).Returns(false);
        currentUserMock.Setup(u => u.ExternalIdentityId).Returns((string?)null);

        var authServiceMock = new Mock<IUserAuthorizationService>();
        var tenantContextMock = new Mock<ITenantContextService>();

        var handler = new GenerateRFQDocumentCommandHandler(
            unitOfWork,
            rendererMock.Object,
            storageMock.Object,
            contextServiceMock.Object,
            currentUserMock.Object,
            authServiceMock.Object,
            tenantContextMock.Object,
            loggerMock.Object);

        var command = new GenerateRFQDocumentCommand
        {
            RFQId = rfq.Id,
            BlankTemplate = true,
            SupplierId = null,
            GeneratedBy = "PublicPortal"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GenerateRFQDocument_SupplierQuotation_UnauthenticatedUser_ShouldThrowForbiddenException()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var supplier = new Supplier { Id = Guid.NewGuid(), Name = "Acme Supplies", Email = "acme@test.com" };
        context.Suppliers?.Add(supplier);

        var office = new Office { Id = Guid.NewGuid(), Name = "GSO" };
        context.Offices?.Add(office);

        var rfq = new ERPEZ.Domain.Entities.Procurement.RFQ
        {
            Id = Guid.NewGuid(),
            RFQNumber = "RFQ-2026-002",
            Status = StatusEnum.Approved,
            RFQSuppliers = [new RFQSupplier { RFQId = Guid.NewGuid(), SupplierId = supplier.Id }]
        };
        context.RFQs?.Add(rfq);
        await context.SaveChangesAsync();

        var (rendererMock, storageMock, contextServiceMock, loggerMock) = CreateMocks();

        var currentUserMock = new Mock<ICurrentUserService>();
        currentUserMock.Setup(u => u.IsAuthenticated).Returns(false);
        currentUserMock.Setup(u => u.ExternalIdentityId).Returns((string?)null);

        var authServiceMock = new Mock<IUserAuthorizationService>();
        var tenantContextMock = new Mock<ITenantContextService>();

        var handler = new GenerateRFQDocumentCommandHandler(
            unitOfWork,
            rendererMock.Object,
            storageMock.Object,
            contextServiceMock.Object,
            currentUserMock.Object,
            authServiceMock.Object,
            tenantContextMock.Object,
            loggerMock.Object);

        var command = new GenerateRFQDocumentCommand
        {
            RFQId = rfq.Id,
            BlankTemplate = false,
            SupplierId = supplier.Id,
            GeneratedBy = "PublicPortal"
        };

        // Act & Assert
        var act = async () => await handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ForbiddenException>();
    }

    [Fact]
    public async Task GenerateRFQDocument_SupplierQuotation_UninvitedSupplier_ShouldThrowValidationException()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var supplier = new Supplier { Id = Guid.NewGuid(), Name = "Uninvited Supplier", Email = "uninvited@test.com" };
        context.Suppliers?.Add(supplier);

        var office = new Office { Id = Guid.NewGuid(), Name = "GSO" };
        context.Offices?.Add(office);

        var rfq = new ERPEZ.Domain.Entities.Procurement.RFQ
        {
            Id = Guid.NewGuid(),
            RFQNumber = "RFQ-2026-003",
            Status = StatusEnum.Approved,
            RFQSuppliers = [] // Not invited
        };
        context.RFQs?.Add(rfq);
        await context.SaveChangesAsync();

        var (rendererMock, storageMock, contextServiceMock, loggerMock) = CreateMocks();

        var currentUserMock = new Mock<ICurrentUserService>();
        currentUserMock.Setup(u => u.IsSuperAdmin).Returns(true);

        var authServiceMock = new Mock<IUserAuthorizationService>();
        var tenantContextMock = new Mock<ITenantContextService>();

        var handler = new GenerateRFQDocumentCommandHandler(
            unitOfWork,
            rendererMock.Object,
            storageMock.Object,
            contextServiceMock.Object,
            currentUserMock.Object,
            authServiceMock.Object,
            tenantContextMock.Object,
            loggerMock.Object);

        var command = new GenerateRFQDocumentCommand
        {
            RFQId = rfq.Id,
            BlankTemplate = false,
            SupplierId = supplier.Id,
            GeneratedBy = "SuperAdmin"
        };

        // Act & Assert
        var act = async () => await handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ValidationException>()
            .WithMessage("*not invited*");
    }

    [Fact]
    public async Task GenerateRFQDocument_SupplierQuotation_AuthorizedProcurementOfficer_ShouldSucceed()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var supplier = new Supplier { Id = Guid.NewGuid(), Name = "Acme Supplies", Email = "acme@test.com" };
        context.Suppliers?.Add(supplier);

        var office = new Office { Id = Guid.NewGuid(), Name = "GSO" };
        context.Offices?.Add(office);

        var rfq = new ERPEZ.Domain.Entities.Procurement.RFQ
        {
            Id = Guid.NewGuid(),
            RFQNumber = "RFQ-2026-004",
            Status = StatusEnum.Approved,
            RFQSuppliers = [new RFQSupplier { RFQId = Guid.NewGuid(), SupplierId = supplier.Id }]
        };
        context.RFQs?.Add(rfq);
        await context.SaveChangesAsync();

        var (rendererMock, storageMock, contextServiceMock, loggerMock) = CreateMocks();

        var currentUserMock = new Mock<ICurrentUserService>();
        currentUserMock.Setup(u => u.IsAuthenticated).Returns(true);
        currentUserMock.Setup(u => u.ExternalIdentityId).Returns("keycloak-user-procurement");

        var tenantId = Guid.NewGuid();
        var tenantContextMock = new Mock<ITenantContextService>();
        tenantContextMock.Setup(t => t.TenantId).Returns(tenantId);

        var authServiceMock = new Mock<IUserAuthorizationService>();
        authServiceMock.Setup(a => a.GetPermissionsAsync("keycloak-user-procurement", tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new HashSet<string> { Permissions.Procurement.rfqManage });

        var handler = new GenerateRFQDocumentCommandHandler(
            unitOfWork,
            rendererMock.Object,
            storageMock.Object,
            contextServiceMock.Object,
            currentUserMock.Object,
            authServiceMock.Object,
            tenantContextMock.Object,
            loggerMock.Object);

        var command = new GenerateRFQDocumentCommand
        {
            RFQId = rfq.Id,
            BlankTemplate = false,
            SupplierId = supplier.Id,
            GeneratedBy = "ProcurementOfficer"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GenerateRFQDocument_SupplierQuotation_AuthorizedMatchingSupplier_ShouldSucceed()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var supplier = new Supplier { Id = Guid.NewGuid(), Name = "Beta Corp", Email = "beta@supplier.com" };
        context.Suppliers?.Add(supplier);

        var office = new Office { Id = Guid.NewGuid(), Name = "GSO" };
        context.Offices?.Add(office);

        var rfq = new ERPEZ.Domain.Entities.Procurement.RFQ
        {
            Id = Guid.NewGuid(),
            RFQNumber = "RFQ-2026-005",
            Status = StatusEnum.Approved,
            RFQSuppliers = [new RFQSupplier { RFQId = Guid.NewGuid(), SupplierId = supplier.Id }]
        };
        context.RFQs?.Add(rfq);
        await context.SaveChangesAsync();

        var (rendererMock, storageMock, contextServiceMock, loggerMock) = CreateMocks();

        var currentUserMock = new Mock<ICurrentUserService>();
        currentUserMock.Setup(u => u.IsAuthenticated).Returns(true);
        currentUserMock.Setup(u => u.ExternalIdentityId).Returns("keycloak-user-beta");
        currentUserMock.Setup(u => u.Email).Returns("beta@supplier.com");

        var tenantId = Guid.NewGuid();
        var tenantContextMock = new Mock<ITenantContextService>();
        tenantContextMock.Setup(t => t.TenantId).Returns(tenantId);

        var authServiceMock = new Mock<IUserAuthorizationService>();
        authServiceMock.Setup(a => a.GetPermissionsAsync("keycloak-user-beta", tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new HashSet<string> { Permissions.Procurement.supplierView });

        var handler = new GenerateRFQDocumentCommandHandler(
            unitOfWork,
            rendererMock.Object,
            storageMock.Object,
            contextServiceMock.Object,
            currentUserMock.Object,
            authServiceMock.Object,
            tenantContextMock.Object,
            loggerMock.Object);

        var command = new GenerateRFQDocumentCommand
        {
            RFQId = rfq.Id,
            BlankTemplate = false,
            SupplierId = supplier.Id,
            GeneratedBy = "beta@supplier.com"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GenerateRFQDocument_SupplierQuotation_DifferentSupplier_ShouldThrowForbiddenException()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var targetSupplier = new Supplier { Id = Guid.NewGuid(), Name = "Target Supplier", Email = "target@supplier.com" };
        context.Suppliers?.Add(targetSupplier);

        var office = new Office { Id = Guid.NewGuid(), Name = "GSO" };
        context.Offices?.Add(office);

        var rfq = new ERPEZ.Domain.Entities.Procurement.RFQ
        {
            Id = Guid.NewGuid(),
            RFQNumber = "RFQ-2026-006",
            Status = StatusEnum.Approved,
            RFQSuppliers = [new RFQSupplier { RFQId = Guid.NewGuid(), SupplierId = targetSupplier.Id }]
        };
        context.RFQs?.Add(rfq);
        await context.SaveChangesAsync();

        var (rendererMock, storageMock, contextServiceMock, loggerMock) = CreateMocks();

        // Caller is a different supplier
        var currentUserMock = new Mock<ICurrentUserService>();
        currentUserMock.Setup(u => u.IsAuthenticated).Returns(true);
        currentUserMock.Setup(u => u.ExternalIdentityId).Returns("keycloak-user-attacker");
        currentUserMock.Setup(u => u.Email).Returns("attacker@supplier.com");

        var tenantId = Guid.NewGuid();
        var tenantContextMock = new Mock<ITenantContextService>();
        tenantContextMock.Setup(t => t.TenantId).Returns(tenantId);

        var authServiceMock = new Mock<IUserAuthorizationService>();
        authServiceMock.Setup(a => a.GetPermissionsAsync("keycloak-user-attacker", tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new HashSet<string> { Permissions.Procurement.supplierView });

        var handler = new GenerateRFQDocumentCommandHandler(
            unitOfWork,
            rendererMock.Object,
            storageMock.Object,
            contextServiceMock.Object,
            currentUserMock.Object,
            authServiceMock.Object,
            tenantContextMock.Object,
            loggerMock.Object);

        var command = new GenerateRFQDocumentCommand
        {
            RFQId = rfq.Id,
            BlankTemplate = false,
            SupplierId = targetSupplier.Id,
            GeneratedBy = "attacker@supplier.com"
        };

        // Act & Assert
        var act = async () => await handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ForbiddenException>();
    }

    [Fact]
    public async Task RFQDocumentContextService_WhenAgencyRepositoryThrowsSchemaError_ShouldFallbackToOfficeHierarchyWithoutFailing()
    {
        // Arrange
        var officeId = Guid.NewGuid();
        var agencyRepoMock = new Mock<IAgencyRepository>();
        agencyRepoMock
            .Setup(r => r.FindAsync(It.IsAny<Expression<Func<Agency, bool>>>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("42703: column a.LetterheadAlignment does not exist"));

        var officeRepoMock = new Mock<IOfficeRepository>();
        officeRepoMock
            .Setup(r => r.GetByIdWithDetailsAsync(officeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Office
            {
                Id = officeId,
                Name = "ICT Division",
                Address = "100 Main Campus Ave",
                Organization = new Organization { Id = Guid.NewGuid(), Name = "NextJump Solutions" }
            });

        var bacMemberRepoMock = new Mock<IRepository<BACMember>>();
        var personnelPosRepoMock = new Mock<IPersonnelPositionRepository>();

        var uowMock = new Mock<IUnitOfWork>();
        uowMock.Setup(u => u.AgencyRepository).Returns(agencyRepoMock.Object);
        uowMock.Setup(u => u.OfficeRepository).Returns(officeRepoMock.Object);
        uowMock.Setup(u => u.BACMemberRepository).Returns(bacMemberRepoMock.Object);
        uowMock.Setup(u => u.PersonnelPositionRepository).Returns(personnelPosRepoMock.Object);

        var config = new ConfigurationBuilder().AddInMemoryCollection().Build();
        var loggerMock = new Mock<ILogger<RFQDocumentContextService>>();

        var service = new RFQDocumentContextService(uowMock.Object, config, loggerMock.Object);

        // Act
        var ctx = await service.ResolveAsync("RFQ-2026-SVP-007", Guid.NewGuid(), officeId, CancellationToken.None);

        // Assert
        ctx.ProcuringEntity.Should().Be("NextJump Solutions");
        ctx.ProcuringEntityAddress.Should().Be("100 Main Campus Ave");
    }

    [Fact]
    public async Task RFQDocumentContextService_WhenAgencyExists_ShouldPreferAgencyNameAndAddress()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var office = new Office
        {
            Id = Guid.NewGuid(),
            Name = "ICT Division",
            Address = "Building B"
        };
        context.Offices?.Add(office);

        context.Agencies?.Add(new Agency
        {
            Id = Guid.NewGuid(),
            Name = "NextJump Solutions Inc.",
            Address = "Corporate Headquarters, Cagayan de Oro",
            LetterheadAlignment = "Center"
        });
        await context.SaveChangesAsync();

        var config = new ConfigurationBuilder().AddInMemoryCollection().Build();
        var loggerMock = new Mock<ILogger<RFQDocumentContextService>>();
        var service = new RFQDocumentContextService(unitOfWork, config, loggerMock.Object);

        // Act
        var ctx = await service.ResolveAsync("RFQ-2026-SVP-007", Guid.NewGuid(), office.Id, CancellationToken.None);

        // Assert
        ctx.ProcuringEntity.Should().Be("NextJump Solutions Inc.");
        ctx.ProcuringEntityAddress.Should().Be("Corporate Headquarters, Cagayan de Oro");
    }
}
