using System;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.ApproveNoticeOfAward;

public record ApproveNoticeOfAwardRequest(
    Guid? SignedDocumentFileId,
    string? SignedDocumentFileName,
    DateOnly? PhilGEPSPostedAt,
    string? PhilGEPSReferenceNumber,
    string? Remarks
);
