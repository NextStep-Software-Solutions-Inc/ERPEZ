using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.CreateNoticeOfAward;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.NoticeOfAwards;

public class CreateNoticeOfAwardCommandHandlerTests
{
    [Fact]
    public async Task Handle_ValidRequest_ShouldCreateDraftWithGeneratedNumber()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var projectId = Guid.NewGuid();
        var resolutionId = Guid.NewGuid();
        var supplierId = Guid.NewGuid();

        var supplier = new Supplier { Id = supplierId, Name = "Tech Supplies Inc." };
        context.Suppliers?.Add(supplier);

        var project = new ProcurementProject
        {
            Id = projectId,
            Title = "IT Equipment Purchase",
            ABC = 500000m
        };
        context.ProcurementProjects?.Add(project);

        var resolution = new BACResolution
        {
            Id = resolutionId,
            ProcurementProjectId = projectId,
            ResolutionNumber = "BAC-RES-2026-001",
            Status = "Approved",
            DateResolved = DateTime.UtcNow
        };
        context.BACResolutions?.Add(resolution);
        await context.SaveChangesAsync();

        var request = new CreateNoticeOfAwardRequest(
            resolutionId,
            new DateOnly(2026, 6, 2),
            new DateOnly(2026, 5, 24),
            "Award for IT Equipment",
            NoticeOfAwardType.GoodsAndServices
        );

        var command = new CreateNoticeOfAwardCommand(request, Guid.NewGuid(), "Jane Staff");
        var handler = new CreateNoticeOfAwardCommandHandler(unitOfWork);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeEmpty();

        var created = await unitOfWork.NoticeOfAwardRepository.FindAsync(n => n.Id == result.Data);
        created.Should().NotBeNull();
        created!.Status.Should().Be(NoticeOfAwardStatus.Draft);
        created.NOANumber.Should().StartWith("NOA-");
        created.AwardedAmount.Should().Be(500000m);
    }

    [Fact]
    public async Task Handle_DuplicateResolution_ShouldFail()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var projectId = Guid.NewGuid();
        var resolutionId = Guid.NewGuid();

        var project = new ProcurementProject { Id = projectId, Title = "Project 1", ABC = 100000m };
        context.ProcurementProjects?.Add(project);

        var resolution = new BACResolution { Id = resolutionId, ProcurementProjectId = projectId, ResolutionNumber = "RES-001" };
        context.BACResolutions?.Add(resolution);

        var existingNoa = new NoticeOfAward
        {
            Id = Guid.NewGuid(),
            NOANumber = "NOA-2026-001",
            BACResolutionId = resolutionId,
            ProcurementProjectId = projectId,
            Status = NoticeOfAwardStatus.Draft
        };
        await unitOfWork.NoticeOfAwardRepository.AddAsync(existingNoa);
        await unitOfWork.SaveChangesAsync();

        var request = new CreateNoticeOfAwardRequest(
            resolutionId,
            new DateOnly(2026, 6, 2),
            new DateOnly(2026, 5, 24),
            "Duplicate NOA attempt",
            NoticeOfAwardType.GoodsAndServices
        );

        var command = new CreateNoticeOfAwardCommand(request, Guid.NewGuid(), "Jane Staff");
        var handler = new CreateNoticeOfAwardCommandHandler(unitOfWork);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("already active");
    }
}
