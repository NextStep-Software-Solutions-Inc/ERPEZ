using System;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.UpdateNoticeOfAward;

public record UpdateNoticeOfAwardRequest(
    DateOnly Date,
    DateOnly DateBid,
    string Description,
    NoticeOfAwardType Type
);
