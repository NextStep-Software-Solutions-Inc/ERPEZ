using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.CreatePR;

public record CreatePRCommand : IRequest<ApiResponse<Guid>>
{
    public DateOnly RequestedDate { get; init; }
    public string PRNumber { get; init; } = string.Empty;
    public Guid? ProcurementCategoryId { get; init; }
    public string? Description { get; init; }
    public string Purpose { get; init; } = string.Empty;
    public Guid OfficeId { get; init; }
    public Guid? PPMPId { get; init; }
    public Guid? FundClusterId { get; init; }
    public Guid? UACSCodeCombinationId { get; init; }
    public PRType PRType { get; init; } = PRType.NonCSE;
    public List<PRItemRequest> Items { get; init; } = [];
}