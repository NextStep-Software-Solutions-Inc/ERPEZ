using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.LogNoticeOfAwardMilestone;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.NoticeOfAwards;

public class LogNoticeOfAwardMilestoneCommandHandlerTests
{
    [Fact]
    public async Task Handle_ApprovedNoa_ShouldLogMilestone()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var noaId = Guid.NewGuid();
        var noa = new NoticeOfAward
        {
            Id = noaId,
            NOANumber = "NOA-2026-001",
            Status = NoticeOfAwardStatus.Approved,
            IssuedAt = DateTime.UtcNow
        };
        await unitOfWork.NoticeOfAwardRepository.AddAsync(noa);
        await unitOfWork.SaveChangesAsync();

        var request = new LogNoticeOfAwardMilestoneRequest(
            NoticeOfAwardMilestoneType.ConformeReceived,
            new DateOnly(2026, 6, 4),
            Guid.NewGuid(),
            "conforme.pdf",
            "Signed by supplier"
        );

        var command = new LogNoticeOfAwardMilestoneCommand(noaId, request, Guid.NewGuid(), "Jane Staff");
        var handler = new LogNoticeOfAwardMilestoneCommandHandler(unitOfWork);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();

        var milestone = await unitOfWork.NoticeOfAwardMilestoneRepository.FindAsync(m => m.NoticeOfAwardId == noaId && m.MilestoneType == NoticeOfAwardMilestoneType.ConformeReceived);
        milestone.Should().NotBeNull();
        milestone!.FileName.Should().Be("conforme.pdf");

        var updatedNoa = await unitOfWork.NoticeOfAwardRepository.FindAsync(n => n.Id == noaId);
        updatedNoa!.ReceivedAt.Should().Be(new DateOnly(2026, 6, 4));
        updatedNoa.ContractExecutionDeadline.Should().Be(new DateOnly(2026, 6, 14));
    }

    [Fact]
    public async Task Handle_PerformanceSecurityWithoutConforme_ShouldFail()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var noaId = Guid.NewGuid();
        var noa = new NoticeOfAward
        {
            Id = noaId,
            NOANumber = "NOA-2026-001",
            Status = NoticeOfAwardStatus.Approved,
            IssuedAt = DateTime.UtcNow
        };
        await unitOfWork.NoticeOfAwardRepository.AddAsync(noa);
        await unitOfWork.SaveChangesAsync();

        var request = new LogNoticeOfAwardMilestoneRequest(
            NoticeOfAwardMilestoneType.PerformanceSecurityPosted,
            new DateOnly(2026, 6, 5),
            Guid.NewGuid(),
            "bond.pdf",
            "Surety bond"
        );

        var command = new LogNoticeOfAwardMilestoneCommand(noaId, request, Guid.NewGuid(), "Jane Staff");
        var handler = new LogNoticeOfAwardMilestoneCommandHandler(unitOfWork);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("Conforme");
    }

    [Fact]
    public async Task Handle_ContractExecutedWithoutPerformanceSecurity_ShouldFail()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var noaId = Guid.NewGuid();
        var noa = new NoticeOfAward
        {
            Id = noaId,
            NOANumber = "NOA-2026-001",
            Status = NoticeOfAwardStatus.Approved,
            IssuedAt = DateTime.UtcNow
        };
        await unitOfWork.NoticeOfAwardRepository.AddAsync(noa);
        await unitOfWork.SaveChangesAsync();

        // Add Conforme
        await unitOfWork.NoticeOfAwardMilestoneRepository.AddAsync(new NoticeOfAwardMilestone
        {
            Id = Guid.NewGuid(),
            NoticeOfAwardId = noaId,
            MilestoneType = NoticeOfAwardMilestoneType.ConformeReceived,
            DateLogged = new DateOnly(2026, 6, 4)
        });
        await unitOfWork.SaveChangesAsync();

        var request = new LogNoticeOfAwardMilestoneRequest(
            NoticeOfAwardMilestoneType.ContractExecuted,
            new DateOnly(2026, 6, 8),
            Guid.NewGuid(),
            "contract.pdf",
            "Signed contract"
        );

        var command = new LogNoticeOfAwardMilestoneCommand(noaId, request, Guid.NewGuid(), "Jane Staff");
        var handler = new LogNoticeOfAwardMilestoneCommandHandler(unitOfWork);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("Performance Security");
    }
}
