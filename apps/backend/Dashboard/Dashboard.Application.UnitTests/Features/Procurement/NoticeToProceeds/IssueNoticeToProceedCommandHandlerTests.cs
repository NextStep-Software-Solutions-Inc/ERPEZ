using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.CreateNoticeToProceed;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.IssueNoticeToProceed;
using ERPEZ.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.NoticeToProceeds;

public class IssueNoticeToProceedCommandHandlerTests
{
    [Fact]
    public async Task Handle_DraftNTP_ShouldTransitionToIssued_AndFreezeSnapshots()
    {
        // Arrange
        using var context = NoticeToProceedTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeToProceedTestHelpers.CreateUnitOfWork(context);
        var currentUserService = NoticeToProceedTestHelpers.CreateCurrentUserService(name: "Officer Maria");
        var (contract, noa, supplier, project) = await NoticeToProceedTestHelpers.SeedApprovedContractAsync(context, ContractStatus.Approved);

        var createHandler = new CreateNoticeToProceedCommandHandler(unitOfWork, currentUserService);
        var createResult = await createHandler.Handle(new CreateNoticeToProceedCommand
        {
            ContractId = contract.Id,
            NTPNumber = "NTP-2026-ISSUE-1",
            NTPDate = DateOnly.FromDateTime(DateTime.UtcNow),
            ImplementationPeriodDays = 45,
            PlaceOfDelivery = "Regional Delivery Warehouse"
        }, CancellationToken.None);

        var ntpId = createResult.Data;
        var issueHandler = new IssueNoticeToProceedCommandHandler(unitOfWork, currentUserService);

        // Act
        var issueResult = await issueHandler.Handle(new IssueNoticeToProceedCommand
        {
            Id = ntpId,
            Remarks = "Officially dispatched to supplier"
        }, CancellationToken.None);

        // Assert
        issueResult.Succeeded.Should().BeTrue();

        var issuedNtp = await unitOfWork.NoticeToProceedRepository.GetByIdAsync(ntpId);
        issuedNtp.Should().NotBeNull();
        issuedNtp!.Status.Should().Be(NoticeToProceedStatus.Issued);
        issuedNtp.IssuedAt.Should().NotBeNull();
        issuedNtp.IssuedByName.Should().Be("Officer Maria");

        // Verify Frozen Snapshots
        issuedNtp.ContractNumberSnapshot.Should().Be(contract.ContractNumber);
        issuedNtp.AwardedAmountSnapshot.Should().Be(noa.AwardedAmount);
        issuedNtp.SupplierNameSnapshot.Should().Be(supplier.Name);
        issuedNtp.SupplierAddressSnapshot.Should().Be(supplier.Address);
        issuedNtp.ProjectTitleSnapshot.Should().Be(project.Title);
    }

    [Fact]
    public async Task Handle_AlreadyIssuedNTP_ShouldFail()
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
            NTPNumber = "NTP-2026-ISSUE-2",
            NTPDate = DateOnly.FromDateTime(DateTime.UtcNow)
        }, CancellationToken.None);

        var ntpId = createResult.Data;
        var issueHandler = new IssueNoticeToProceedCommandHandler(unitOfWork, currentUserService);

        // First issuance
        await issueHandler.Handle(new IssueNoticeToProceedCommand { Id = ntpId }, CancellationToken.None);

        // Second issuance attempt
        var secondResult = await issueHandler.Handle(new IssueNoticeToProceedCommand { Id = ntpId }, CancellationToken.None);

        // Assert
        secondResult.Succeeded.Should().BeFalse();
        secondResult.Message.Should().Contain("Draft");
    }
}
