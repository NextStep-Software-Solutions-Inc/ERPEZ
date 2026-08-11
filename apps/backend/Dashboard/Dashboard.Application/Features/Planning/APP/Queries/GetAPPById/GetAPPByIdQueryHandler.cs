using ERPEZ.Application.Features.Planning.APP.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APP.Queries.GetAPPById;

public class GetAPPByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetAPPByIdQuery, ApiResponse<APPResponse>>
{
    public async Task<ApiResponse<APPResponse>> Handle(GetAPPByIdQuery request, CancellationToken cancellationToken)
    {
        var app = await unitOfWork.APPRepository.GetAPPWithDetailsAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("APP not found.");

        var response = new APPResponse
        {
            Id = app.Id,
            APPNumber = app.APPNumber,
            Name = app.Name,
            FiscalYearId = app.FiscalYearId,
            FiscalYearName = app.FiscalYear != null ? app.FiscalYear.Year.ToString() : string.Empty,
            APPType = app.APPType,
            Batch = app.Batch,
            Quarter = app.Quarter,
            VersionNumber = app.VersionNumber,
            VersionDate = app.VersionDate,
            SourceAPPId = app.SourceAPPId,
            IsFinal = app.IsFinal,
            Remarks = app.Remarks,
            Description = app.Description,
            Status = app.Status.ToString(),
            SubmittedDate = app.SubmittedDate,
            ApprovedDate = app.ApprovedDate,
            CreatedAt = app.CreatedAt,
            CreatedBy = app.CreatedBy,
            UpdatedAt = app.UpdatedAt,
            UpdatedBy = app.UpdatedBy,
            FiscalYear = app.FiscalYear == null ? null : new APPFiscalYearResponse
            {
                Id = app.FiscalYear.Id,
                Year = app.FiscalYear.Year,
                Status = app.FiscalYear.Status,
                StartDate = app.FiscalYear.StartDate,
                EndDate = app.FiscalYear.EndDate
            },
            APPItems = app.APPItems.Where(item => !item.IsDeleted).Select(item => new APPItemSummaryResponse
            {
                Id = item.Id,
                PPMPItemId = item.PPMPItemId,
                PPMPItemName = item.PPMPItem?.Name ?? string.Empty,
                ProcurementModeId = item.ProcurementModeId,
                ProcurementModeName = item.ProcurementMode?.Name ?? string.Empty,
                FundSourceId = item.FundSourceId,
                FundSourceName = item.FundSource?.Name ?? string.Empty,
                OfficeId = item.OfficeId,
                OfficeName = item.Office?.Name ?? string.Empty,
                PAPCode = item.PAPCode,
                Remarks = item.Remarks,
                IsEarlyProcurementActivity = item.IsEarlyProcurementActivity,
                IsOutsourced = item.IsOutsourced,
                StartOfProcurementOverride = item.StartOfProcurementOverride,
                EndOfProcurementOverride = item.EndOfProcurementOverride,
                IsNew = item.IsNew,
                IsRevised = item.IsRevised,
                Schedules = item.PPMPItem?.APPProcurementSchedules
                    .Where(schedule => !schedule.IsDeleted)
                    .Select(schedule => new APPItemScheduleSummaryResponse
                    {
                        Id = schedule.Id,
                        ProcurementActivityTypeId = schedule.ProcurementActivityTypeId,
                        ProcurementActivityTypeName = schedule.ProcurementActivityType?.Name ?? string.Empty,
                        ScheduledDate = schedule.ScheduledDate,
                        CustomDateText = schedule.CustomDateText
                    }).ToList() ?? []
            }).ToList(),
            APPPPMPs = app.APPPPMPs.Where(link => !link.IsDeleted).Select(link => new APPPPMPLinkResponse
            {
                Id = link.Id,
                PPMPId = link.PPMPId,
                PPMP = link.PPMP == null ? null : new APPPPMPPPMPResponse
                {
                    Id = link.PPMP.Id,
                    OfficeId = link.PPMP.OfficeId,
                    OfficeName = link.PPMP.Office?.Name ?? string.Empty,
                    FiscalYearId = link.PPMP.FiscalYearId,
                    FiscalYearYear = link.PPMP.FiscalYear?.Year.ToString() ?? string.Empty,
                    FundSourceId = link.PPMP.FundSourceId,
                    FundSourceName = link.PPMP.FundSource?.Name ?? string.Empty,
                    PPMPNumber = link.PPMP.PPMPNumber,
                    Description = link.PPMP.Description,
                    IsFinal = link.PPMP.IsFinal,
                    Version = link.PPMP.Version,
                    TotalEstimatedBudget = link.PPMP.TotalEstimatedBudget,
                    Status = link.PPMP.Status.ToString()
                }
            }).ToList()
        };

        return ApiResponse<APPResponse>.Success(response);
    }
}
