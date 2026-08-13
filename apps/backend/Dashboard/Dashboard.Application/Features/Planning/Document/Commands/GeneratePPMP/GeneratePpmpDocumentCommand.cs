using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GeneratePPMP;

public record GeneratePpmpDocumentCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid         PpmpId      { get; init; }
    public required ExportFormat Format      { get; init; }
    public          string       GeneratedBy { get; set; } = string.Empty;
}