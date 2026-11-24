using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.ApproveNoticeOfAward;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.NoticeOfAwards;

public class ApproveNoticeOfAwardCommandHandlerTests
{
    [Fact]
    public async Task Handle_ForApprovalNoa_ShouldApproveAndStartSla()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var noaId = Guid.NewGuid();
        var noa = new NoticeOfAward
        {
            Id = noaId,
            NOANumber = "NOA-2026-001",
            Status = NoticeOfAwardStatus.ForApproval
        };
        await unitOfWork.NoticeOfAwardRepository.AddAsync(noa);
        await unitOfWork.SaveChangesAsync();

        var signedFileId = Guid.NewGuid();
        var request = new ApproveNoticeOfAwardRequest(
            signedFileId,
            "NOA-2026-001-signed.pdf",
            new DateOnly(2026, 6, 10),
            "PHILGEPS-12345",
            "Approved by HoPE"
        );

        var hopeId = Guid.NewGuid();
        var command = new ApproveNoticeOfAwardCommand(noaId, request, hopeId, "Dr. Director");
        var handler = new ApproveNoticeOfAwardCommandHandler(unitOfWork);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();

        var updated = await unitOfWork.NoticeOfAwardRepository.FindAsync(n => n.Id == noaId);
        updated.Should().NotBeNull();
        updated!.Status.Should().Be(NoticeOfAwardStatus.Approved);
        updated.ApprovedById.Should().Be(hopeId);
        updated.IssuedAt.Should().NotBeNull();
        updated.ReceivedAt.Should().BeNull();
        updated.ContractExecutionDeadline.Should().BeNull();
        updated.SignedDocumentFileId.Should().Be(signedFileId);
    }

    [Fact]
    public async Task Handle_DraftNoa_ShouldRejectApproval()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var noaId = Guid.NewGuid();
        var noa = new NoticeOfAward
        {
            Id = noaId,
            NOANumber = "NOA-2026-001",
            Status = NoticeOfAwardStatus.Draft
        };
        await unitOfWork.NoticeOfAwardRepository.AddAsync(noa);
        await unitOfWork.SaveChangesAsync();

        var request = new ApproveNoticeOfAwardRequest(Guid.NewGuid(), "signed.pdf", null, null, null);
        var command = new ApproveNoticeOfAwardCommand(noaId, request, Guid.NewGuid(), "Dr. Director");
        var handler = new ApproveNoticeOfAwardCommandHandler(unitOfWork);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("Must be 'ForApproval'");
    }
}
