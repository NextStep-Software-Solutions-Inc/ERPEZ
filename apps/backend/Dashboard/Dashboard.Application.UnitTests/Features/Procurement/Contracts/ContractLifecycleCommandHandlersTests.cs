using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.Contracts.Commands.ApproveContract;
using ERPEZ.Application.Features.Procurement.Contracts.Commands.CancelContract;
using ERPEZ.Application.Features.Procurement.Contracts.Commands.ReturnContract;
using ERPEZ.Application.Features.Procurement.Contracts.Commands.SubmitContract;
using ERPEZ.Application.Features.Procurement.Contracts.Commands.UpdateContract;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.Contracts;

public class ContractLifecycleCommandHandlersTests
{
    [Fact]
    public async Task UpdateContract_InDraftStatus_ShouldSucceed()
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);
        var currentUserService = ContractTestHelpers.CreateCurrentUserService(name: "Jane Editor");
        var (noa, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context);

        var contract = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = "CONTRACT-2026-ORIGINAL",
            NoticeOfAwardId = noa.Id,
            ContractDate = new DateOnly(2026, 6, 20),
            Description = "Original draft description",
            Status = ContractStatus.Draft,
            CreatedAt = DateTime.UtcNow
        };
        await unitOfWork.ContractRepository.AddAsync(contract);
        await unitOfWork.SaveChangesAsync();

        var command = new UpdateContractCommand
        {
            Id = contract.Id,
            ContractNumber = "CONTRACT-2026-UPDATED",
            ContractDate = new DateOnly(2026, 6, 25),
            Description = "Updated contract scope description"
        };
        var handler = new UpdateContractCommandHandler(unitOfWork, currentUserService);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();

        var updated = await unitOfWork.ContractRepository.GetByIdAsync(contract.Id);
        updated.Should().NotBeNull();
        updated!.ContractNumber.Should().Be("CONTRACT-2026-UPDATED");
        updated.ContractDate.Should().Be(new DateOnly(2026, 6, 25));
        updated.Description.Should().Be("Updated contract scope description");
        updated.UpdatedBy.Should().Be("Jane Editor");
    }

    [Fact]
    public async Task UpdateContract_InReturnedStatus_ShouldSucceed()
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);
        var currentUserService = ContractTestHelpers.CreateCurrentUserService(name: "Jane Editor");
        var (noa, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context);

        var contract = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = "CONTRACT-2026-RET",
            NoticeOfAwardId = noa.Id,
            ContractDate = new DateOnly(2026, 6, 20),
            Description = "Initial scope with errors",
            Status = ContractStatus.Returned,
            ReturnRemarks = "Please adjust target dates.",
            CreatedAt = DateTime.UtcNow
        };
        await unitOfWork.ContractRepository.AddAsync(contract);
        await unitOfWork.SaveChangesAsync();

        var command = new UpdateContractCommand
        {
            Id = contract.Id,
            ContractNumber = "CONTRACT-2026-RET",
            ContractDate = new DateOnly(2026, 6, 28),
            Description = "Corrected scope as requested"
        };
        var handler = new UpdateContractCommandHandler(unitOfWork, currentUserService);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        var updated = await unitOfWork.ContractRepository.GetByIdAsync(contract.Id);
        updated!.Description.Should().Be("Corrected scope as requested");
    }

    [Theory]
    [InlineData(ContractStatus.ForApproval)]
    [InlineData(ContractStatus.Approved)]
    [InlineData(ContractStatus.Executed)]
    [InlineData(ContractStatus.Cancelled)]
    public async Task UpdateContract_InLockedStatus_ShouldFail(ContractStatus lockedStatus)
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);
        var currentUserService = ContractTestHelpers.CreateCurrentUserService(name: "Jane Editor");
        var (noa, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context);

        var contract = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = "CONTRACT-2026-LOCKED",
            NoticeOfAwardId = noa.Id,
            Status = lockedStatus,
            CreatedAt = DateTime.UtcNow
        };
        await unitOfWork.ContractRepository.AddAsync(contract);
        await unitOfWork.SaveChangesAsync();

        var command = new UpdateContractCommand
        {
            Id = contract.Id,
            ContractNumber = "CONTRACT-2026-MUTATE",
            ContractDate = new DateOnly(2026, 6, 25),
            Description = "Attempted illegal modification"
        };
        var handler = new UpdateContractCommandHandler(unitOfWork, currentUserService);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("cannot be updated");
    }

    [Fact]
    public async Task SubmitContract_FromDraft_ShouldTransitionToForApproval()
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);
        var actorId = Guid.NewGuid();
        var currentUserService = ContractTestHelpers.CreateCurrentUserService(userId: actorId.ToString(), name: "Jane Submitter");
        var (noa, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context);

        var contract = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = "CONTRACT-2026-SUBMIT",
            NoticeOfAwardId = noa.Id,
            Status = ContractStatus.Draft,
            CreatedAt = DateTime.UtcNow
        };
        await unitOfWork.ContractRepository.AddAsync(contract);
        await unitOfWork.SaveChangesAsync();

        var command = new SubmitContractCommand(contract.Id);
        var handler = new SubmitContractCommandHandler(unitOfWork, currentUserService);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        var updated = await unitOfWork.ContractRepository.GetByIdAsync(contract.Id);
        updated!.Status.Should().Be(ContractStatus.ForApproval);
        updated.SubmittedById.Should().Be(actorId);
        updated.SubmittedAt.Should().NotBeNull();
        updated.UpdatedBy.Should().Be("Jane Submitter");
    }

    [Fact]
    public async Task SubmitContract_FromReturned_ShouldTransitionToForApproval()
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);
        var currentUserService = ContractTestHelpers.CreateCurrentUserService(name: "Jane Submitter");
        var (noa, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context);

        var contract = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = "CONTRACT-2026-RESUBMIT",
            NoticeOfAwardId = noa.Id,
            Status = ContractStatus.Returned,
            CreatedAt = DateTime.UtcNow
        };
        await unitOfWork.ContractRepository.AddAsync(contract);
        await unitOfWork.SaveChangesAsync();

        var command = new SubmitContractCommand(contract.Id);
        var handler = new SubmitContractCommandHandler(unitOfWork, currentUserService);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        var updated = await unitOfWork.ContractRepository.GetByIdAsync(contract.Id);
        updated!.Status.Should().Be(ContractStatus.ForApproval);
    }

    [Theory]
    [InlineData(ContractStatus.ForApproval)]
    [InlineData(ContractStatus.Approved)]
    [InlineData(ContractStatus.Executed)]
    [InlineData(ContractStatus.Cancelled)]
    public async Task SubmitContract_FromInvalidStatus_ShouldFail(ContractStatus invalidStatus)
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);
        var currentUserService = ContractTestHelpers.CreateCurrentUserService(name: "Jane Submitter");
        var (noa, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context);

        var contract = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = "CONTRACT-2026-BADSUBMIT",
            NoticeOfAwardId = noa.Id,
            Status = invalidStatus,
            CreatedAt = DateTime.UtcNow
        };
        await unitOfWork.ContractRepository.AddAsync(contract);
        await unitOfWork.SaveChangesAsync();

        var command = new SubmitContractCommand(contract.Id);
        var handler = new SubmitContractCommandHandler(unitOfWork, currentUserService);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("cannot be submitted for approval");
    }

    [Fact]
    public async Task ApproveContract_FromForApproval_ShouldTransitionToApprovedAndNotExecuted()
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);
        var approverId = Guid.NewGuid();
        var currentUserService = ContractTestHelpers.CreateCurrentUserService(userId: approverId.ToString(), name: "Hon. Legal Director");
        var (noa, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context);

        var contract = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = "CONTRACT-2026-APPROVE",
            NoticeOfAwardId = noa.Id,
            Status = ContractStatus.ForApproval,
            CreatedAt = DateTime.UtcNow
        };
        await unitOfWork.ContractRepository.AddAsync(contract);
        await unitOfWork.SaveChangesAsync();

        var command = new ApproveContractCommand(contract.Id, "Approved by BAC and Legal Counsel.");
        var handler = new ApproveContractCommandHandler(unitOfWork, currentUserService);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();

        var approved = await unitOfWork.ContractRepository.GetByIdAsync(contract.Id);
        approved.Should().NotBeNull();
        approved!.Status.Should().Be(ContractStatus.Approved);
        approved.Status.Should().NotBe(ContractStatus.Executed); // Execution is Phase 4
        approved.ApprovedById.Should().Be(approverId);
        approved.ApprovedByName.Should().Be("Hon. Legal Director");
        approved.ApprovedAt.Should().NotBeNull();
        approved.ApprovalRemarks.Should().Be("Approved by BAC and Legal Counsel.");
        approved.ExecutedAt.Should().BeNull(); // Not executed yet
    }

    [Theory]
    [InlineData(ContractStatus.Draft)]
    [InlineData(ContractStatus.Approved)]
    [InlineData(ContractStatus.Returned)]
    [InlineData(ContractStatus.Executed)]
    [InlineData(ContractStatus.Cancelled)]
    public async Task ApproveContract_FromNonForApproval_ShouldFail(ContractStatus nonForApprovalStatus)
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);
        var currentUserService = ContractTestHelpers.CreateCurrentUserService(name: "Approver");
        var (noa, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context);

        var contract = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = "CONTRACT-2026-BADAPPROVE",
            NoticeOfAwardId = noa.Id,
            Status = nonForApprovalStatus,
            CreatedAt = DateTime.UtcNow
        };
        await unitOfWork.ContractRepository.AddAsync(contract);
        await unitOfWork.SaveChangesAsync();

        var command = new ApproveContractCommand(contract.Id, "test");
        var handler = new ApproveContractCommandHandler(unitOfWork, currentUserService);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("cannot be approved. Must be 'ForApproval'");
    }

    [Fact]
    public async Task ReturnContract_FromForApproval_WithValidRemarks_ShouldTransitionToReturned()
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);
        var returnerId = Guid.NewGuid();
        var currentUserService = ContractTestHelpers.CreateCurrentUserService(userId: returnerId.ToString(), name: "HoPE Reviewer");
        var (noa, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context);

        var contract = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = "CONTRACT-2026-RETURN",
            NoticeOfAwardId = noa.Id,
            Status = ContractStatus.ForApproval,
            CreatedAt = DateTime.UtcNow
        };
        await unitOfWork.ContractRepository.AddAsync(contract);
        await unitOfWork.SaveChangesAsync();

        var command = new ReturnContractCommand(contract.Id, "Please revise clause 4.2 to match biddings specs.");
        var handler = new ReturnContractCommandHandler(unitOfWork, currentUserService);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();

        var returned = await unitOfWork.ContractRepository.GetByIdAsync(contract.Id);
        returned.Should().NotBeNull();
        returned!.Status.Should().Be(ContractStatus.Returned);
        returned.ReturnRemarks.Should().Be("Please revise clause 4.2 to match biddings specs.");
        returned.ReturnedById.Should().Be(returnerId);
        returned.ReturnedAt.Should().NotBeNull();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("Too short")] // Under 10 characters
    public async Task ReturnContract_WithShortRemarks_ShouldFail(string invalidRemarks)
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);
        var currentUserService = ContractTestHelpers.CreateCurrentUserService(name: "Reviewer");
        var (noa, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context);

        var contract = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = "CONTRACT-2026-SHORTRETURN",
            NoticeOfAwardId = noa.Id,
            Status = ContractStatus.ForApproval,
            CreatedAt = DateTime.UtcNow
        };
        await unitOfWork.ContractRepository.AddAsync(contract);
        await unitOfWork.SaveChangesAsync();

        var command = new ReturnContractCommand(contract.Id, invalidRemarks);
        var handler = new ReturnContractCommandHandler(unitOfWork, currentUserService);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("at least 10 characters");
    }

    [Theory]
    [InlineData(ContractStatus.Draft)]
    [InlineData(ContractStatus.Approved)]
    [InlineData(ContractStatus.Returned)]
    [InlineData(ContractStatus.Executed)]
    public async Task ReturnContract_FromNonForApprovalStatus_ShouldFail(ContractStatus status)
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);
        var currentUserService = ContractTestHelpers.CreateCurrentUserService(name: "Reviewer");
        var (noa, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context);

        var contract = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = "CONTRACT-2026-BADRETURN",
            NoticeOfAwardId = noa.Id,
            Status = status,
            CreatedAt = DateTime.UtcNow
        };
        await unitOfWork.ContractRepository.AddAsync(contract);
        await unitOfWork.SaveChangesAsync();

        var command = new ReturnContractCommand(contract.Id, "Sufficient length revision remarks here");
        var handler = new ReturnContractCommandHandler(unitOfWork, currentUserService);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("cannot be returned. Must be 'ForApproval'");
    }

    [Theory]
    [InlineData(ContractStatus.Draft)]
    [InlineData(ContractStatus.Returned)]
    public async Task CancelContract_FromDraftOrReturned_ShouldSucceed(ContractStatus cancellableStatus)
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);
        var currentUserService = ContractTestHelpers.CreateCurrentUserService(name: "Jane Canceller");
        var (noa, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context);

        var contract = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = "CONTRACT-2026-CANCEL",
            NoticeOfAwardId = noa.Id,
            Status = cancellableStatus,
            CreatedAt = DateTime.UtcNow
        };
        await unitOfWork.ContractRepository.AddAsync(contract);
        await unitOfWork.SaveChangesAsync();

        var command = new CancelContractCommand(contract.Id);
        var handler = new CancelContractCommandHandler(unitOfWork, currentUserService);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        var cancelled = await unitOfWork.ContractRepository.GetByIdAsync(contract.Id);
        cancelled!.Status.Should().Be(ContractStatus.Cancelled);
    }

    [Theory]
    [InlineData(ContractStatus.ForApproval)]
    [InlineData(ContractStatus.Approved)]
    [InlineData(ContractStatus.Executed)]
    [InlineData(ContractStatus.Cancelled)]
    public async Task CancelContract_FromLockedStatus_ShouldFail(ContractStatus nonCancellableStatus)
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);
        var currentUserService = ContractTestHelpers.CreateCurrentUserService(name: "Jane Canceller");
        var (noa, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context);

        var contract = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = "CONTRACT-2026-NOCANCEL",
            NoticeOfAwardId = noa.Id,
            Status = nonCancellableStatus,
            CreatedAt = DateTime.UtcNow
        };
        await unitOfWork.ContractRepository.AddAsync(contract);
        await unitOfWork.SaveChangesAsync();

        var command = new CancelContractCommand(contract.Id);
        var handler = new CancelContractCommandHandler(unitOfWork, currentUserService);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("cannot be cancelled");
    }
}
