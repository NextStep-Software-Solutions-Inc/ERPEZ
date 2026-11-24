using System;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.GenerateNoticeToProceedDocument;

public record GenerateNoticeToProceedDocumentCommand : IRequest<ApiResponse<Guid>>
{
    public Guid NoticeToProceedId { get; init; }
    public ExportFormat Format { get; init; } = ExportFormat.Pdf;
    public string GeneratedBy { get; init; } = "System";
}
