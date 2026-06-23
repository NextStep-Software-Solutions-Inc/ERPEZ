// GenerateConsolidatedOpcrDocumentCommand.cs
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateConsolidatedOPCR;

public record GenerateConsolidatedOpcrDocumentCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid         ConsolidationId  { get; init; }
    public required ExportFormat Format       { get; init; }
    public          string       RatingPeriod { get; init; } = string.Empty;
    public          string       GeneratedBy  { get; set; } = string.Empty;
}