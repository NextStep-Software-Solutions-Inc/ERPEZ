using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.Contracts.Commands.CreateContract;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.Contracts;

public class CreateContractCommandHandlerTests
{
    [Fact]
    public async Task Handle_ApprovedNoa_ShouldCreateContractInDraftStatus()
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);
        var currentUserService = ContractTestHelpers.CreateCurrentUserService(name: "Jane Procurement Staff");
        var (noa, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context, NoticeOfAwardStatus.Approved);

        var command = new CreateContractCommand
        {
            NoticeOfAwardId = noa.Id,
            ContractNumber = "CONTRACT-2026-001",
            ContractDate = new DateOnly(2026, 6, 20),
            Description = "Formal bilateral agreement for IT Infrastructure"
        };
        var handler = new CreateContractCommandHandler(unitOfWork, currentUserService);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeEmpty();

        var created = await unitOfWork.ContractRepository.GetByIdAsync(result.Data);
        created.Should().NotBeNull();
        created!.Status.Should().Be(ContractStatus.Draft);
        created.ContractNumber.Should().Be("CONTRACT-2026-001");
        created.NoticeOfAwardId.Should().Be(noa.Id);
        created.ContractDate.Should().Be(new DateOnly(2026, 6, 20));
        created.Description.Should().Be("Formal bilateral agreement for IT Infrastructure");
        created.CreatedBy.Should().Be("Jane Procurement Staff");
    }

    [Fact]
    public async Task Handle_NonExistentNoa_ShouldFailWithNotFound()
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);
        var currentUserService = ContractTestHelpers.CreateCurrentUserService(name: "Jane Procurement Staff");

        var command = new CreateContractCommand
        {
            NoticeOfAwardId = Guid.NewGuid(),
            ContractNumber = "CONTRACT-2026-999",
            ContractDate = new DateOnly(2026, 6, 20),
            Description = "Contract with invalid NOA"
        };
        var handler = new CreateContractCommandHandler(unitOfWork, currentUserService);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("Notice of Award not found");
    }

    [Theory]
    [InlineData(NoticeOfAwardStatus.Draft)]
    [InlineData(NoticeOfAwardStatus.ForApproval)]
    [InlineData(NoticeOfAwardStatus.Returned)]
    public async Task Handle_NonApprovedNoa_ShouldFail(NoticeOfAwardStatus unapprovedStatus)
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);
        var currentUserService = ContractTestHelpers.CreateCurrentUserService(name: "Jane Procurement Staff");
        var (noa, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context, unapprovedStatus);

        var command = new CreateContractCommand
        {
            NoticeOfAwardId = noa.Id,
            ContractNumber = "CONTRACT-2026-UNAPP",
            ContractDate = new DateOnly(2026, 6, 20),
            Description = "Contract from unapproved NOA"
        };
        var handler = new CreateContractCommandHandler(unitOfWork, currentUserService);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("Only 'Approved' Notice of Award can be contracted");
    }

    [Fact]
    public async Task Handle_NoaAlreadyHasActiveContract_ShouldFailWithConflict()
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);
        var currentUserService = ContractTestHelpers.CreateCurrentUserService(name: "Jane Procurement Staff");
        var (noa, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context, NoticeOfAwardStatus.Approved);

        var existingContract = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = "CONTRACT-2026-EXISTING",
            NoticeOfAwardId = noa.Id,
            Status = ContractStatus.Draft,
            CreatedAt = DateTime.UtcNow
        };
        await unitOfWork.ContractRepository.AddAsync(existingContract);
        await unitOfWork.SaveChangesAsync();

        var command = new CreateContractCommand
        {
            NoticeOfAwardId = noa.Id,
            ContractNumber = "CONTRACT-2026-DUPLICATE",
            ContractDate = new DateOnly(2026, 6, 20),
            Description = "Second contract attempt"
        };
        var handler = new CreateContractCommandHandler(unitOfWork, currentUserService);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("An active contract already exists for this Notice of Award");
    }

    [Fact]
    public async Task Handle_PreviousContractCancelled_ShouldAllowCreationOfNewContract()
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);
        var currentUserService = ContractTestHelpers.CreateCurrentUserService(name: "Jane Procurement Staff");
        var (noa, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context, NoticeOfAwardStatus.Approved);

        // A previous contract was cancelled
        var cancelledContract = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = "CONTRACT-2026-CANCELLED",
            NoticeOfAwardId = noa.Id,
            Status = ContractStatus.Cancelled,
            CreatedAt = DateTime.UtcNow.AddDays(-5)
        };
        await unitOfWork.ContractRepository.AddAsync(cancelledContract);
        await unitOfWork.SaveChangesAsync();

        var command = new CreateContractCommand
        {
            NoticeOfAwardId = noa.Id,
            ContractNumber = "CONTRACT-2026-RECREATED",
            ContractDate = new DateOnly(2026, 6, 25),
            Description = "New contract replacing cancelled draft"
        };
        var handler = new CreateContractCommandHandler(unitOfWork, currentUserService);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeEmpty();

        var created = await unitOfWork.ContractRepository.GetByIdAsync(result.Data);
        created.Should().NotBeNull();
        created!.ContractNumber.Should().Be("CONTRACT-2026-RECREATED");
        created.Status.Should().Be(ContractStatus.Draft);
    }

    [Fact]
    public async Task Handle_AutoGeneratedContractNumber_WhenContractNumberOmitted_ShouldGenerateSequentialNumber()
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);
        var currentUserService = ContractTestHelpers.CreateCurrentUserService(name: "Jane Procurement Staff");
        var (noa, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context, NoticeOfAwardStatus.Approved);

        var command = new CreateContractCommand
        {
            NoticeOfAwardId = noa.Id,
            ContractNumber = null, // Omitted
            ContractDate = new DateOnly(2026, 6, 20),
            Description = "Contract with auto numbering"
        };
        var handler = new CreateContractCommandHandler(unitOfWork, currentUserService);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        var created = await unitOfWork.ContractRepository.GetByIdAsync(result.Data);
        created.Should().NotBeNull();
        created!.ContractNumber.Should().StartWith($"CONTRACT-{DateTime.UtcNow.Year}-");
    }

    [Fact]
    public async Task Handle_DuplicateContractNumberAmongActiveContracts_ShouldFail()
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);
        var currentUserService = ContractTestHelpers.CreateCurrentUserService(name: "Jane Procurement Staff");
        var (noa1, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context, NoticeOfAwardStatus.Approved);

        // Another NOA
        var (noa2, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context, NoticeOfAwardStatus.Approved);

        var existingContract = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = "CONTRACT-2026-UNIQUE",
            NoticeOfAwardId = noa1.Id,
            Status = ContractStatus.Draft,
            CreatedAt = DateTime.UtcNow
        };
        await unitOfWork.ContractRepository.AddAsync(existingContract);
        await unitOfWork.SaveChangesAsync();

        var command = new CreateContractCommand
        {
            NoticeOfAwardId = noa2.Id,
            ContractNumber = "CONTRACT-2026-UNIQUE", // Duplicate number
            ContractDate = new DateOnly(2026, 6, 20),
            Description = "Contract with duplicate number"
        };
        var handler = new CreateContractCommandHandler(unitOfWork, currentUserService);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("is already in use");
    }
}
