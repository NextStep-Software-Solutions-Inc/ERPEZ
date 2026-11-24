using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.RecordNoticeToProceedReceipt;

public record RecordNoticeToProceedReceiptCommand : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; init; }
    public DateOnly ReceivedAt { get; init; }
    public string ReceivedByName { get; init; } = string.Empty;

    // Frontend compatibility properties
    public DateOnly? ReceivedDate { get; init; }
    public string? ConformeName { get; init; }
    public string? ConformeDesignation { get; init; }
    public DateOnly? ConformeDate { get; init; }
    public string? Remarks { get; init; }

    public Guid? SignedDocumentFileId { get; init; }
    public string? SignedDocumentFileName { get; init; }

    public DateOnly EffectiveReceivedAt => ReceivedAt != default
        ? ReceivedAt
        : (ReceivedDate ?? ConformeDate ?? default);

    public string EffectiveReceivedByName
    {
        get
        {
            if (!string.IsNullOrWhiteSpace(ReceivedByName))
                return ReceivedByName.Trim();

            if (!string.IsNullOrWhiteSpace(ConformeName))
            {
                return !string.IsNullOrWhiteSpace(ConformeDesignation)
                    ? $"{ConformeName.Trim()} ({ConformeDesignation.Trim()})"
                    : ConformeName.Trim();
            }

            return string.Empty;
        }
    }
}
