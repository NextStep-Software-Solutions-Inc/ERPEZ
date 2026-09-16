using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.GenerateAOBDocument;

public record GenerateAOBDocumentCommand : IRequest<ApiResponse<Guid>>
{
    public Guid AOBId { get; init; }
    public ExportFormat Format { get; init; } = ExportFormat.Pdf;
    public string GeneratedBy { get; init; } = "system";
}
