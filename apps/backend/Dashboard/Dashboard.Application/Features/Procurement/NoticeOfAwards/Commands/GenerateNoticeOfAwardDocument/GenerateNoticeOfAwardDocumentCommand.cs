using System;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.GenerateNoticeOfAwardDocument;

public record GenerateNoticeOfAwardDocumentCommand : IRequest<ApiResponse<Guid>>
{
    public Guid NoticeOfAwardId { get; init; }
    public ExportFormat Format { get; init; } = ExportFormat.Pdf;
    public string GeneratedBy { get; init; } = "system";
}
