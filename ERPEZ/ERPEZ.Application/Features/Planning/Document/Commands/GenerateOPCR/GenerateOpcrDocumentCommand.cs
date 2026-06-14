using ERPEZ.Application.Common.Dtos;
using ERPEZ.Application.Features.Planning.Document.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateOPCR;

public record GenerateOpcrDocumentCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid                 OfficeId    { get; init; }
    public required string               FiscalYear  { get; init; }
    public required ExportFormat         Format      { get; init; }
    public required string               Unit        { get; init; }
    public required List<OpcrFunctionDto> Functions  { get; init; }
    public required List<SignatoryDto>   Signatories { get; init; }
    public          string               GeneratedBy { get; set; } = string.Empty;
}