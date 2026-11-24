using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.CreateNoticeToProceed;
using ERPEZ.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.NoticeToProceeds;

public class CreateNoticeToProceedCommandHandlerTests
{
    [Fact]
    public async Task Handle_ApprovedContract_ShouldCreateNoticeToProceedInDraftStatus()
    {
        // Arrange
        using var context = NoticeToProceedTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeToProceedTestHelpers.CreateUnitOfWork(context);
        var currentUserService = NoticeToProceedTestHelpers.CreateCurrentUserService(name: "Jane Officer");
        var (contract, _, _, _) = await NoticeToProceedTestHelpers.SeedApprovedContractAsync(context, ContractStatus.Approved);

        var command = new CreateNoticeToProceedCommand
        {
            ContractId = contract.Id,
            NTPNumber = "NTP-2026-001",
            NTPDate = DateOnly.FromDateTime(DateTime.UtcNow),
            EffectivityDate = DateOnly.FromDateTime(DateTime.UtcNow),
            ImplementationPeriodDays = 30,
            PlaceOfDelivery = "Main Office Warehouse",
            Description = "Notice to Proceed for Ergonomic Workstations"
        };
        var handler = new CreateNoticeToProceedCommandHandler(unitOfWork, currentUserService);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeEmpty();

        var created = await unitOfWork.NoticeToProceedRepository.GetByIdAsync(result.Data);
        created.Should().NotBeNull();
        created!.Status.Should().Be(NoticeToProceedStatus.Draft);
        created.NTPNumber.Should().Be("NTP-2026-001");
        created.ContractId.Should().Be(contract.Id);
        created.NTPDate.Should().Be(DateOnly.FromDateTime(DateTime.UtcNow));
        created.ImplementationPeriodDays.Should().Be(30);
        created.PlaceOfDelivery.Should().Be("Main Office Warehouse");
        created.CreatedBy.Should().Be("Jane Officer");
    }

    [Fact]
    public async Task Handle_ExecutedContract_ShouldCreateNoticeToProceedInDraftStatus()
    {
        // Arrange
        using var context = NoticeToProceedTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeToProceedTestHelpers.CreateUnitOfWork(context);
        var currentUserService = NoticeToProceedTestHelpers.CreateCurrentUserService();
        var (contract, _, _, _) = await NoticeToProceedTestHelpers.SeedApprovedContractAsync(context, ContractStatus.Executed);

        var command = new CreateNoticeToProceedCommand
        {
            ContractId = contract.Id,
            NTPNumber = "NTP-2026-002",
            NTPDate = DateOnly.FromDateTime(DateTime.UtcNow)
        };
        var handler = new CreateNoticeToProceedCommandHandler(unitOfWork, currentUserService);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeEmpty();
    }

    [Fact]
    public async Task Handle_UnapprovedContract_ShouldFailWithValidationError()
    {
        // Arrange
        using var context = NoticeToProceedTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeToProceedTestHelpers.CreateUnitOfWork(context);
        var currentUserService = NoticeToProceedTestHelpers.CreateCurrentUserService();
        var (contract, _, _, _) = await NoticeToProceedTestHelpers.SeedApprovedContractAsync(context, ContractStatus.Draft);

        var command = new CreateNoticeToProceedCommand
        {
            ContractId = contract.Id,
            NTPNumber = "NTP-2026-003",
            NTPDate = DateOnly.FromDateTime(DateTime.UtcNow)
        };
        var handler = new CreateNoticeToProceedCommandHandler(unitOfWork, currentUserService);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("Approved");
    }

    [Fact]
    public async Task Handle_DuplicateActiveNTP_ShouldFailWithValidationError()
    {
        // Arrange
        using var context = NoticeToProceedTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeToProceedTestHelpers.CreateUnitOfWork(context);
        var currentUserService = NoticeToProceedTestHelpers.CreateCurrentUserService();
        var (contract, _, _, _) = await NoticeToProceedTestHelpers.SeedApprovedContractAsync(context, ContractStatus.Approved);

        var handler = new CreateNoticeToProceedCommandHandler(unitOfWork, currentUserService);

        // First creation
        var firstResult = await handler.Handle(new CreateNoticeToProceedCommand
        {
            ContractId = contract.Id,
            NTPNumber = "NTP-2026-010",
            NTPDate = DateOnly.FromDateTime(DateTime.UtcNow)
        }, CancellationToken.None);
        firstResult.Succeeded.Should().BeTrue();

        // Second creation attempt on same contract
        var secondResult = await handler.Handle(new CreateNoticeToProceedCommand
        {
            ContractId = contract.Id,
            NTPNumber = "NTP-2026-011",
            NTPDate = DateOnly.FromDateTime(DateTime.UtcNow)
        }, CancellationToken.None);

        // Assert
        secondResult.Succeeded.Should().BeFalse();
        secondResult.Message.Should().Contain("already exists");
    }

    [Fact]
    public async Task Handle_AutoGeneratesNTPNumber_WhenBlank()
    {
        // Arrange
        using var context = NoticeToProceedTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeToProceedTestHelpers.CreateUnitOfWork(context);
        var currentUserService = NoticeToProceedTestHelpers.CreateCurrentUserService();
        var (contract, _, _, _) = await NoticeToProceedTestHelpers.SeedApprovedContractAsync(context, ContractStatus.Approved);

        var command = new CreateNoticeToProceedCommand
        {
            ContractId = contract.Id,
            NTPNumber = "", // blank to trigger auto-numbering
            NTPDate = DateOnly.FromDateTime(DateTime.UtcNow)
        };
        var handler = new CreateNoticeToProceedCommandHandler(unitOfWork, currentUserService);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        var created = await unitOfWork.NoticeToProceedRepository.GetByIdAsync(result.Data);
        created.Should().NotBeNull();
        created!.NTPNumber.Should().StartWith($"NTP-{DateTime.UtcNow.Year}-");
    }
}
