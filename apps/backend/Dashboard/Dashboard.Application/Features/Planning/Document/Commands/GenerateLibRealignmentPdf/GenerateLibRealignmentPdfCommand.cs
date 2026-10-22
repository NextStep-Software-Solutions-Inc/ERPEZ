using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateLibRealignmentPdf;

public record GenerateLibRealignmentPdfCommand : IRequest<ApiResponse<Guid>>
{
    public Guid RealignmentId { get; init; }
    public ExportFormat Format { get; init; } = ExportFormat.Pdf;
    public string GeneratedBy { get; init; } = string.Empty;
}
