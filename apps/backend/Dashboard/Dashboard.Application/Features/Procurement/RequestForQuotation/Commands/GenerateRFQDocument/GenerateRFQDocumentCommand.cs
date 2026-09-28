using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.GenerateRFQDocument;

public record GenerateRFQDocumentCommand : IRequest<ApiResponse<Guid>>
{
    public Guid RFQId { get; init; }
    public ExportFormat Format { get; init; } = ExportFormat.Pdf;
    public string GeneratedBy { get; init; } = "system";
    public Guid? SupplierId { get; init; }
    public bool BlankTemplate { get; init; } = false;
}
