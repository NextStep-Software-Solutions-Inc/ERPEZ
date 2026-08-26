using ERPEZ.Application.Common.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateMarketScoping;

public class GenerateMarketScopingDocumentCommand : IRequest<ApiResponse<Guid>>
{
    public Guid MarketScopingId { get; set; }
    public ExportFormat Format { get; set; } = ExportFormat.Pdf;
    public string GeneratedBy { get; set; } = string.Empty;
}
