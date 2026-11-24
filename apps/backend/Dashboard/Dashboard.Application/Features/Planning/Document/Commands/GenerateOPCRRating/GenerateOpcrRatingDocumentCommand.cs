// GenerateOpcrRatingDocumentCommand.cs
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateOPCRRating;

public record GenerateOpcrRatingDocumentCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid         OPCRId        { get; init; }
    public          Guid?        EvaluationId  { get; init; }
    public required ExportFormat Format        { get; init; }
    public          string       GeneratedBy   { get; set; } = string.Empty;
}