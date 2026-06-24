// GenerateProposedOpcrDocumentCommand.cs
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateOPCR;

public record GenerateProposedOpcrDocumentCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid         OPCRId      { get; init; }
    public required ExportFormat Format      { get; init; }
    public          string       GeneratedBy { get; set; } = string.Empty;
}