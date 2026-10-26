using System;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.CreateNoticeOfAward;

public record CreateNoticeOfAwardRequest(
    Guid BacResolutionId,
    DateOnly Date,
    DateOnly DateBid,
    string Description,
    NoticeOfAwardType Type
);
