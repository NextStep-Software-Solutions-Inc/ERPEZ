using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.CancelNoticeToProceed;

public record CancelNoticeToProceedCommand : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; init; }
    public string Reason { get; init; } = string.Empty;
}
