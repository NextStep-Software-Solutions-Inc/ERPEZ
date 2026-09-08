using System;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.LogNoticeOfAwardMilestone;

public record LogNoticeOfAwardMilestoneRequest(
    NoticeOfAwardMilestoneType MilestoneType,
    DateOnly DateLogged,
    Guid? FileId,
    string? FileName,
    string? Remarks
);
