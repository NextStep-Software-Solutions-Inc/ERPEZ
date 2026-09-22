using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.CreateNoticeToProceed;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.IssueNoticeToProceed;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Queries.GetAvailableContractsForNoticeToProceed;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Queries.GetNoticeToProceedById;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Queries.GetNoticeToProceeds;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Queries.GetNoticeToProceedSummary;
using ERPEZ.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.NoticeToProceeds;

public class NoticeToProceedQueriesTests
{
    [Fact]
    public async Task GetNoticeToProceedsQuery_ShouldReturnPaginatedResults()
    {
        // Arrange
        using var context = NoticeToProceedTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeToProceedTestHelpers.CreateUnitOfWork(context);
        var currentUserService = NoticeToProceedTestHelpers.CreateCurrentUserService();
        var (contract, _, _, _) = await NoticeToProceedTestHelpers.SeedApprovedContractAsync(context, ContractStatus.Approved);

        var createHandler = new CreateNoticeToProceedCommandHandler(unitOfWork, currentUserService);
        await createHandler.Handle(new CreateNoticeToProceedCommand
        {
            ContractId = contract.Id,
            NTPNumber = "NTP-2026-QUERY-1",
            NTPDate = DateOnly.FromDateTime(DateTime.UtcNow)
        }, CancellationToken.None);

        var queryHandler = new GetNoticeToProceedsQueryHandler(unitOfWork, NoticeToProceedTestHelpers.CreateSieveProcessor());

        // Act
        var result = await queryHandler.Handle(new GetNoticeToProceedsQuery
        {
            PageNumber = 1,
            PageSize = 10
        }, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data.Should().HaveCount(1);
        result.Data![0].NTPNumber.Should().Be("NTP-2026-QUERY-1");
    }

    [Fact]
    public async Task GetNoticeToProceedSummaryQuery_ShouldReturnAccurateCounts()
    {
        // Arrange
        using var context = NoticeToProceedTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeToProceedTestHelpers.CreateUnitOfWork(context);
        var currentUserService = NoticeToProceedTestHelpers.CreateCurrentUserService();

        var (contract1, _, _, _) = await NoticeToProceedTestHelpers.SeedApprovedContractAsync(context, ContractStatus.Approved);

        var createHandler = new CreateNoticeToProceedCommandHandler(unitOfWork, currentUserService);
        var res1 = await createHandler.Handle(new CreateNoticeToProceedCommand
        {
            ContractId = contract1.Id,
            NTPNumber = "NTP-2026-SUMM-1",
            NTPDate = DateOnly.FromDateTime(DateTime.UtcNow)
        }, CancellationToken.None);

        var issueHandler = new IssueNoticeToProceedCommandHandler(unitOfWork, currentUserService);
        await issueHandler.Handle(new IssueNoticeToProceedCommand { Id = res1.Data }, CancellationToken.None);

        var summaryHandler = new GetNoticeToProceedSummaryQueryHandler(unitOfWork);

        // Act
        var summaryResult = await summaryHandler.Handle(new GetNoticeToProceedSummaryQuery(), CancellationToken.None);

        // Assert
        summaryResult.Succeeded.Should().BeTrue();
        summaryResult.Data.Should().NotBeNull();
        summaryResult.Data!.TotalCount.Should().Be(1);
        summaryResult.Data.IssuedCount.Should().Be(1);
        summaryResult.Data.DraftCount.Should().Be(0);
    }

    [Fact]
    public async Task GetAvailableContractsQuery_ShouldFilterOutContractsWithActiveNTP()
    {
        // Arrange
        using var context = NoticeToProceedTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeToProceedTestHelpers.CreateUnitOfWork(context);
        var currentUserService = NoticeToProceedTestHelpers.CreateCurrentUserService();

        var (contract1, _, _, _) = await NoticeToProceedTestHelpers.SeedApprovedContractAsync(context, ContractStatus.Approved);

        var availableHandler = new GetAvailableContractsForNoticeToProceedQueryHandler(unitOfWork);

        // Before creating NTP: contract1 should be available
        var beforeResult = await availableHandler.Handle(new GetAvailableContractsForNoticeToProceedQuery(), CancellationToken.None);
        beforeResult.Succeeded.Should().BeTrue();
        beforeResult.Data.Should().ContainSingle(c => c.Id == contract1.Id);

        // Create NTP for contract1
        var createHandler = new CreateNoticeToProceedCommandHandler(unitOfWork, currentUserService);
        await createHandler.Handle(new CreateNoticeToProceedCommand
        {
            ContractId = contract1.Id,
            NTPNumber = "NTP-2026-AVAIL-1",
            NTPDate = DateOnly.FromDateTime(DateTime.UtcNow)
        }, CancellationToken.None);

        // After creating NTP: contract1 should NO LONGER be available
        var afterResult = await availableHandler.Handle(new GetAvailableContractsForNoticeToProceedQuery(), CancellationToken.None);
        afterResult.Succeeded.Should().BeTrue();
        afterResult.Data.Should().NotContain(c => c.Id == contract1.Id);
    }
}
