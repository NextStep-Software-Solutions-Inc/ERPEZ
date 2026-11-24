using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Queries.GetNoticeToProceedPdf;

public record NoticeToProceedPdfFileResult(byte[] FileBytes, string FileName, string ContentType);

public record GetNoticeToProceedPdfQuery(Guid NoticeToProceedId) : IRequest<ApiResponse<NoticeToProceedPdfFileResult>>;
