using System;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Contracts.Commands.GenerateContractDocument;

public record GenerateContractDocumentCommand : IRequest<ApiResponse<Guid>>
{
    public Guid ContractId { get; init; }
    public ExportFormat Format { get; init; } = ExportFormat.Pdf;
    public string GeneratedBy { get; init; } = "system";
}