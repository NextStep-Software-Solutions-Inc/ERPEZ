using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Queries.GetNoticeOfAwardPdf;

public record NoticeOfAwardPdfFileResult(byte[] FileBytes, string FileName, string ContentType);

public record GetNoticeOfAwardPdfQuery(Guid NoticeOfAwardId) : IRequest<ApiResponse<NoticeOfAwardPdfFileResult>>;
