using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.UpdateNoticeToProceed;

public record UpdateNoticeToProceedCommand : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; init; }
    public string NTPNumber { get; init; } = string.Empty;
    public DateOnly NTPDate { get; init; }
    public DateOnly? EffectivityDate { get; init; }
    public DateOnly? CommencementDate { get; init; }
    public int? ImplementationPeriodDays { get; init; }
    public DateOnly? DeliveryCompletionDeadline { get; init; }
    public string? PlaceOfDelivery { get; init; }
    public string? Description { get; init; }
}
