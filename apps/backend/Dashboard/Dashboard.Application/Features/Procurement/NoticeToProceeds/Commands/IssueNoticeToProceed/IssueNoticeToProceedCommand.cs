using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.IssueNoticeToProceed;

public record IssueNoticeToProceedCommand : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; init; }
    public DateOnly? EffectivityDate { get; init; }
    public DateOnly? CommencementDate { get; init; }
    public string? Remarks { get; init; }
}
