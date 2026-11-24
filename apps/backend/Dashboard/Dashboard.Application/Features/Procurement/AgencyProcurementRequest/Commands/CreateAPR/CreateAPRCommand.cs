using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using System;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.CreateAPR;

public class CreateAPRCommand : IRequest<ApiResponse<Guid>>
{
    public Guid APPId { get; set; }
    public Guid OfficeId { get; set; }
    public Guid FiscalYearId { get; set; }

    public string? AgencyControlNumber { get; set; }
    public string? AgencyAccountCode { get; set; }
    public DateOnly RequestDate { get; set; }
    public string? Description { get; set; }

    public APRModeOfDelivery ModeOfDelivery { get; set; } = APRModeOfDelivery.FastLane;
    public APRInsufficientFundsAction InsufficientFundsAction { get; set; } = APRInsufficientFundsAction.ReduceQuantity;

    public bool RequiresObR { get; set; }
    public bool RequiresCBA { get; set; }
    public bool RequiresCompleteSpecifications { get; set; }
    public string? AdditionalRemarks { get; set; }

    // Step 1 selections — one entry per checked APPItem (Image 6/9)
    public List<CreateAPRItemDto> Items { get; set; } = [];
}
