using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateWFP;

public record GenerateWfpDocumentCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid          WfpId       { get; init; }
    public required ExportFormat  Format      { get; init; }
    public          string        GeneratedBy { get; set; } = string.Empty;
}
