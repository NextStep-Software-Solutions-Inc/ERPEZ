using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.CreateNoticeToProceed;

public record CreateNoticeToProceedCommand : IRequest<ApiResponse<Guid>>
{
    public Guid ContractId { get; init; }
    public string? NTPNumber { get; init; }
    public DateOnly NTPDate { get; init; }
    public DateOnly? EffectivityDate { get; init; }
    public DateOnly? CommencementDate { get; init; }
    public int? ImplementationPeriodDays { get; init; }
    public DateOnly? DeliveryCompletionDeadline { get; init; }
    public string? PlaceOfDelivery { get; init; }
    public string? Description { get; init; }
}
