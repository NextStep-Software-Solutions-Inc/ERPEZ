using System;
using System.Collections.Generic;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Utils;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.NoticeOfAwards;

public class NoticeOfAwardSlaCalculatorTests
{
    [Fact]
    public void CalculateSla_DraftNoa_ShouldReturnNotIssued()
    {
        var noa = new NoticeOfAward
        {
            Id = Guid.NewGuid(),
            Status = NoticeOfAwardStatus.Draft
        };

        var sla = NoticeOfAwardSlaCalculator.CalculateSla(noa);

        sla.IsIssued.Should().BeFalse();
        sla.IsOpen.Should().BeFalse();
        sla.IsComplete.Should().BeFalse();
        sla.IsOverdue.Should().BeFalse();
        sla.ProgressPercent.Should().Be(0);
        sla.Label.Should().Be("Draft");
        sla.Tone.Should().Be("muted");
    }

    [Fact]
    public void CalculateSla_ApprovedNoa_BeforeConforme_ShouldBeAwaitingConforme()
    {
        var issuedAt = new DateTime(2026, 6, 1, 10, 0, 0, DateTimeKind.Utc);
        var today = new DateTime(2026, 6, 3, 10, 0, 0, DateTimeKind.Utc);

        var noa = new NoticeOfAward
        {
            Id = Guid.NewGuid(),
            Status = NoticeOfAwardStatus.Approved,
            IssuedAt = issuedAt,
            ReceivedAt = null
        };

        var sla = NoticeOfAwardSlaCalculator.CalculateSla(noa, utcNow: today);

        sla.IsIssued.Should().BeTrue();
        sla.IsOpen.Should().BeFalse();
        sla.IsComplete.Should().BeFalse();
        sla.IsOverdue.Should().BeFalse();
        sla.DaysRemaining.Should().BeNull();
        sla.Label.Should().Be("Issued — Awaiting Conforme");
        sla.Tone.Should().Be("info");
    }

    [Fact]
    public void CalculateSla_ApprovedNoa_WithConforme_Within10Days_ShouldBeOpenAndTrackDays()
    {
        var issuedAt = new DateTime(2026, 6, 1, 10, 0, 0, DateTimeKind.Utc);
        var receivedAt = new DateOnly(2026, 6, 2);
        var today = new DateTime(2026, 6, 4, 10, 0, 0, DateTimeKind.Utc);

        var noa = new NoticeOfAward
        {
            Id = Guid.NewGuid(),
            Status = NoticeOfAwardStatus.Approved,
            IssuedAt = issuedAt,
            ReceivedAt = receivedAt,
            ContractExecutionDeadline = receivedAt.AddDays(10)
        };

        var sla = NoticeOfAwardSlaCalculator.CalculateSla(noa, utcNow: today);

        sla.IsIssued.Should().BeTrue();
        sla.IsOpen.Should().BeTrue();
        sla.IsComplete.Should().BeFalse();
        sla.IsOverdue.Should().BeFalse();
        sla.DaysRemaining.Should().Be(8);
        sla.Tone.Should().Be("muted");
    }

    [Fact]
    public void CalculateSla_ApprovedNoa_WithAllMilestones_ShouldBeComplete()
    {
        var noaId = Guid.NewGuid();
        var issuedAt = new DateTime(2026, 6, 1, 10, 0, 0, DateTimeKind.Utc);
        var receivedAt = new DateOnly(2026, 6, 2);

        var noa = new NoticeOfAward
        {
            Id = noaId,
            Status = NoticeOfAwardStatus.Approved,
            IssuedAt = issuedAt,
            ReceivedAt = receivedAt,
            ContractExecutionDeadline = receivedAt.AddDays(10)
        };

        var milestones = new List<NoticeOfAwardMilestone>
        {
            new() { NoticeOfAwardId = noaId, MilestoneType = NoticeOfAwardMilestoneType.ConformeReceived, DateLogged = receivedAt },
            new() { NoticeOfAwardId = noaId, MilestoneType = NoticeOfAwardMilestoneType.PerformanceSecurityPosted, DateLogged = new DateOnly(2026, 6, 5) },
            new() { NoticeOfAwardId = noaId, MilestoneType = NoticeOfAwardMilestoneType.ContractExecuted, DateLogged = new DateOnly(2026, 6, 8) }
        };

        var sla = NoticeOfAwardSlaCalculator.CalculateSla(noa, milestones);

        sla.IsComplete.Should().BeTrue();
        sla.IsOpen.Should().BeFalse();
        sla.IsOverdue.Should().BeFalse();
        sla.ProgressPercent.Should().Be(100);
        sla.CompletedMilestones.Should().Be(3);
        sla.Label.Should().Be("Complete");
        sla.Tone.Should().Be("success");
    }

    [Fact]
    public void CalculateSla_ApprovedNoa_WithConforme_After10Days_ShouldBeOverdue()
    {
        var issuedAt = new DateTime(2026, 6, 1, 10, 0, 0, DateTimeKind.Utc);
        var receivedAt = new DateOnly(2026, 6, 2);
        var today = new DateTime(2026, 6, 15, 10, 0, 0, DateTimeKind.Utc); // 13 days after receipt

        var noa = new NoticeOfAward
        {
            Id = Guid.NewGuid(),
            Status = NoticeOfAwardStatus.Approved,
            IssuedAt = issuedAt,
            ReceivedAt = receivedAt,
            ContractExecutionDeadline = receivedAt.AddDays(10)
        };

        var sla = NoticeOfAwardSlaCalculator.CalculateSla(noa, utcNow: today);

        sla.IsOverdue.Should().BeTrue();
        sla.RequiresCascadeDecision.Should().BeTrue();
        sla.IsOpen.Should().BeTrue();
        sla.Tone.Should().Be("destructive");
    }
}
