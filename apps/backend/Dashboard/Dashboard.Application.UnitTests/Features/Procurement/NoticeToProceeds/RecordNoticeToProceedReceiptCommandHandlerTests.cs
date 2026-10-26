using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.CreateNoticeToProceed;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.IssueNoticeToProceed;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.RecordNoticeToProceedReceipt;
using ERPEZ.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.NoticeToProceeds;

public class RecordNoticeToProceedReceiptCommandHandlerTests
{
    [Fact]
    public async Task Handle_IssuedNTP_ShouldTransitionToReceived_AndSetConformeFields()
    {
        // Arrange
        using var context = NoticeToProceedTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeToProceedTestHelpers.CreateUnitOfWork(context);
        var currentUserService = NoticeToProceedTestHelpers.CreateCurrentUserService(name: "Records Officer");
        var (contract, _, _, _) = await NoticeToProceedTestHelpers.SeedApprovedContractAsync(context, ContractStatus.Approved);

        var ntpDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-2));

        var createHandler = new CreateNoticeToProceedCommandHandler(unitOfWork, currentUserService);
        var createResult = await createHandler.Handle(new CreateNoticeToProceedCommand
        {
            ContractId = contract.Id,
            NTPNumber = "NTP-2026-REC-1",
            NTPDate = ntpDate
        }, CancellationToken.None);

        var ntpId = createResult.Data;
        var issueHandler = new IssueNoticeToProceedCommandHandler(unitOfWork, currentUserService);
        await issueHandler.Handle(new IssueNoticeToProceedCommand { Id = ntpId }, CancellationToken.None);

        var recordHandler = new RecordNoticeToProceedReceiptCommandHandler(unitOfWork, currentUserService);
        var receiptDate = DateOnly.FromDateTime(DateTime.UtcNow);

        // Act
        var result = await recordHandler.Handle(new RecordNoticeToProceedReceiptCommand
        {
            Id = ntpId,
            ReceivedAt = receiptDate,
            ReceivedByName = "Engr. Roberto Gomez"
        }, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();

        var receivedNtp = await unitOfWork.NoticeToProceedRepository.GetByIdAsync(ntpId);
        receivedNtp.Should().NotBeNull();
        receivedNtp!.Status.Should().Be(NoticeToProceedStatus.Received);
        receivedNtp.ReceivedAt.Should().Be(receiptDate);
        receivedNtp.ReceivedByName.Should().Be("Engr. Roberto Gomez");
    }

    [Fact]
    public async Task Handle_DraftNTP_ShouldFailWhenNotYetIssued()
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
            NTPNumber = "NTP-2026-REC-2",
            NTPDate = DateOnly.FromDateTime(DateTime.UtcNow)
        }, CancellationToken.None);

        var ntpId = createResult.Data;
        var recordHandler = new RecordNoticeToProceedReceiptCommandHandler(unitOfWork, currentUserService);

        // Act (without issuing first)
        var result = await recordHandler.Handle(new RecordNoticeToProceedReceiptCommand
        {
            Id = ntpId,
            ReceivedAt = DateOnly.FromDateTime(DateTime.UtcNow),
            ReceivedByName = "Engr. Roberto Gomez"
        }, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("Issued");
    }

    [Fact]
    public async Task Handle_ReceiptDatePriorToNTPDate_ShouldFailValidation()
    {
        // Arrange
        using var context = NoticeToProceedTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeToProceedTestHelpers.CreateUnitOfWork(context);
        var currentUserService = NoticeToProceedTestHelpers.CreateCurrentUserService();
        var (contract, _, _, _) = await NoticeToProceedTestHelpers.SeedApprovedContractAsync(context, ContractStatus.Approved);

        var ntpDate = DateOnly.FromDateTime(DateTime.UtcNow);

        var createHandler = new CreateNoticeToProceedCommandHandler(unitOfWork, currentUserService);
        var createResult = await createHandler.Handle(new CreateNoticeToProceedCommand
        {
            ContractId = contract.Id,
            NTPNumber = "NTP-2026-REC-3",
            NTPDate = ntpDate
        }, CancellationToken.None);

        var ntpId = createResult.Data;
        var issueHandler = new IssueNoticeToProceedCommandHandler(unitOfWork, currentUserService);
        await issueHandler.Handle(new IssueNoticeToProceedCommand { Id = ntpId }, CancellationToken.None);

        var recordHandler = new RecordNoticeToProceedReceiptCommandHandler(unitOfWork, currentUserService);

        // Act (receipt date before NTP date)
        var result = await recordHandler.Handle(new RecordNoticeToProceedReceiptCommand
        {
            Id = ntpId,
            ReceivedAt = ntpDate.AddDays(-3),
            ReceivedByName = "Engr. Roberto Gomez"
        }, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("earlier");
    }
}
