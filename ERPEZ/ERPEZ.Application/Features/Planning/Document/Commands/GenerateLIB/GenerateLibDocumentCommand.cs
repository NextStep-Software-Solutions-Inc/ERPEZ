using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateLIB;

public record GenerateLibDocumentCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid         LibId       { get; init; }
    public required ExportFormat Format      { get; init; }
    public          string       GeneratedBy { get; init; } = string.Empty;
}