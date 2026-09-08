using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.ReturnNoticeOfAward;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.NoticeOfAwards;

public class ReturnNoticeOfAwardCommandHandlerTests
{
    [Fact]
    public async Task Handle_ForApprovalNoa_ShouldReturnWithRemarks()
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

        var request = new ReturnNoticeOfAwardRequest("Please update item specs.");
        var command = new ReturnNoticeOfAwardCommand(noaId, request, Guid.NewGuid(), "Dr. Director");
        var handler = new ReturnNoticeOfAwardCommandHandler(unitOfWork);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();

        var updated = await unitOfWork.NoticeOfAwardRepository.FindAsync(n => n.Id == noaId);
        updated.Should().NotBeNull();
        updated!.Status.Should().Be(NoticeOfAwardStatus.Returned);
        updated.ReturnReason.Should().Be("Please update item specs.");
    }
}
