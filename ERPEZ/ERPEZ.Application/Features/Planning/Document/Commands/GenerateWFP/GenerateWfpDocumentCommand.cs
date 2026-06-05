using ERPEZ.Application.Common.Dtos;
using ERPEZ.Application.Features.Planning.Document.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateWFP;

public record GenerateWfpDocumentCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid                 AgencyId        { get; init; }
    public required string               FiscalYear      { get; init; }
    public required ExportFormat         Format          { get; init; }
    public required string               ProjectTitle    { get; init; }
    public required int                  DurationMonths  { get; init; }
    public required DateOnly             ProjectStartDate { get; init; }
    public required DateOnly             ProjectEndDate   { get; init; }
    public required List<WfpObjectiveDto> Objectives     { get; init; }
    public required List<SignatoryDto>   Signatories     { get; init; }
    public          string               GeneratedBy     { get; set; } = string.Empty;
}