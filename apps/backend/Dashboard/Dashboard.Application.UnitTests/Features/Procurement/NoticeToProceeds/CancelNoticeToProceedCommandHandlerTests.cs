using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.CancelNoticeToProceed;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.CreateNoticeToProceed;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.IssueNoticeToProceed;
using ERPEZ.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.NoticeToProceeds;

public class CancelNoticeToProceedCommandHandlerTests
{
    [Fact]
    public async Task Handle_IssuedNTP_ShouldTransitionToCancelled_AndRecordReason()
    {
        // Arrange
        using var context = NoticeToProceedTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeToProceedTestHelpers.CreateUnitOfWork(context);
        var currentUserService = NoticeToProceedTestHelpers.CreateCurrentUserService(name: "Legal Officer");
        var (contract, _, _, _) = await NoticeToProceedTestHelpers.SeedApprovedContractAsync(context, ContractStatus.Approved);

        var createHandler = new CreateNoticeToProceedCommandHandler(unitOfWork, currentUserService);
        var createResult = await createHandler.Handle(new CreateNoticeToProceedCommand
        {
            ContractId = contract.Id,
            NTPNumber = "NTP-2026-CAN-1",
            NTPDate = DateOnly.FromDateTime(DateTime.UtcNow)
        }, CancellationToken.None);

        var ntpId = createResult.Data;
        var issueHandler = new IssueNoticeToProceedCommandHandler(unitOfWork, currentUserService);
        await issueHandler.Handle(new IssueNoticeToProceedCommand { Id = ntpId }, CancellationToken.None);

        var cancelHandler = new CancelNoticeToProceedCommandHandler(unitOfWork, currentUserService);

        // Act
        var result = await cancelHandler.Handle(new CancelNoticeToProceedCommand
        {
            Id = ntpId,
            Reason = "Project scope suspended due to agency restructuring"
        }, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();

        var cancelledNtp = await unitOfWork.NoticeToProceedRepository.GetByIdAsync(ntpId);
        cancelledNtp.Should().NotBeNull();
        cancelledNtp!.Status.Should().Be(NoticeToProceedStatus.Cancelled);
        cancelledNtp.CancellationReason.Should().Be("Project scope suspended due to agency restructuring");
        cancelledNtp.CancelledAt.Should().NotBeNull();
    }

    [Fact]
    public async Task Handle_AlreadyCancelledNTP_ShouldFail()
    {
        // Arrange
        using var context = NoticeToProceedTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeToProceedTestHelpers.CreateUnitOfWork(context);
        var currentUserService = NoticeToProceedTestHelpers.CreateCurrentUserService();
        var (contract, _, _, _) = await NoticeToProceedTestHelpers.SeedApprovedContractAsync(context, ContractStatus.Approved);

        var createHandler = new CreateNoticeToProceedCommandHandler(unitOfWork, currentUserService);
        var createResult = await createHandler.Handle(new CreateNoticeToProceedCommand
        {
            ContractId = contract.Id,
            NTPNumber = "NTP-2026-CAN-2",
            NTPDate = DateOnly.FromDateTime(DateTime.UtcNow)
        }, CancellationToken.None);

        var ntpId = createResult.Data;
        var cancelHandler = new CancelNoticeToProceedCommandHandler(unitOfWork, currentUserService);

        // First cancel
        await cancelHandler.Handle(new CancelNoticeToProceedCommand
        {
            Id = ntpId,
            Reason = "Initial cancellation reason"
        }, CancellationToken.None);

        // Second cancel attempt
        var secondResult = await cancelHandler.Handle(new CancelNoticeToProceedCommand
        {
            Id = ntpId,
            Reason = "Second cancellation attempt"
        }, CancellationToken.None);

        // Assert
        secondResult.Succeeded.Should().BeFalse();
        secondResult.Message.Should().Contain("already cancelled");
    }
}
