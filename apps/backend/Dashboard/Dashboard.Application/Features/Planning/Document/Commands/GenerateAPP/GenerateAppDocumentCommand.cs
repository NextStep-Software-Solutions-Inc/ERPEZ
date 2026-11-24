using System;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateAPP;

public record GenerateAppDocumentCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid         AppId       { get; init; }
    public required ExportFormat Format      { get; init; }
    public          string       GeneratedBy { get; set; } = string.Empty;
}