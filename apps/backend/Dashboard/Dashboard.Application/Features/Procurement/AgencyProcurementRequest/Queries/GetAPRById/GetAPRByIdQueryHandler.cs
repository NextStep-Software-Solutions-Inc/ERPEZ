using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Dtos;
using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Queries.GetAPRById;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Queries.GetAPRById;

public class GetAPRByIdQueryHandler : IRequestHandler<GetAPRByIdQuery, ApiResponse<APRDetailDto>>
{
    private readonly IUnitOfWork unitOfWork;

    public GetAPRByIdQueryHandler(IUnitOfWork unitOfWork)
    {
        this.unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<APRDetailDto>> Handle(GetAPRByIdQuery request, CancellationToken cancellationToken)
    {
        var apr = await unitOfWork.APRRepository.GetAPRWithDetailsAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("APR not found.");

        return ApiResponse<APRDetailDto>.Success(new APRDetailDto
        {
            Id = apr.Id,
            APRNumber = apr.APRNumber,
            APPId = apr.APPId,
            APPNumber = apr.APP.APPNumber,
            OfficeId = apr.OfficeId,
            OfficeName = apr.Office?.Name ?? string.Empty,
            FiscalYearId = apr.FiscalYearId,
            FiscalYear = apr.FiscalYear?.Year ?? 0,
            TotalAmount = apr.TotalAmount,
            Status = apr.Status,
            AgencyControlNumber = apr.AgencyControlNumber,
            AgencyAccountCode = apr.AgencyAccountCode,
            RequestDate = apr.RequestDate,
            Description = apr.Description,
            ModeOfDelivery = apr.ModeOfDelivery,
            InsufficientFundsAction = apr.InsufficientFundsAction,
            RequiresObR = apr.RequiresObR,
            RequiresCBA = apr.RequiresCBA,
            RequiresCompleteSpecifications = apr.RequiresCompleteSpecifications,
            AdditionalRemarks = apr.AdditionalRemarks,
            SubmittedDate = apr.SubmittedDate,
            ApprovedDate = apr.ApprovedDate,
            Items = apr.APRItems.Select(item => new APRItemDto
            {
                Id = item.Id,
                APPItemId = item.APPItemId,
                PPMPItemId = item.PPMPItemId,
                Description = item.PPMPItem?.Name ?? string.Empty,
                Unit = item.PPMPItem?.Unit ?? string.Empty,
                QuantityRequested = item.QuantityRequested,
                UnitCost = item.UnitCost,
                TotalCost = item.TotalCost,
                Milestones = item.APRItemMilestones.Select(m => new APRItemMilestoneDto
                {
                    Id = m.Id,
                    ProcurementActivityTypeId = m.ProcurementActivityTypeId,
                    ProcurementActivityTypeName = m.ProcurementActivityType?.Name ?? string.Empty,
                    ScheduledDate = m.ScheduledDate,
                    Remarks = m.Remarks
                }).ToList()
            }).ToList()
        }, "APR retrieved successfully.");
    }
}
