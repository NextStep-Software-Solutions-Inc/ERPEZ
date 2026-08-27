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
            APPItems = app.APPItems.Where(item => !item.IsDeleted).Select(item =>
            {
                var allocQty = item.PPMPItem?.PPMPItemAllocations.Where(a => !a.IsDeleted).Sum(a => a.Quantity) ?? 0;
                var unitPrice = item.PPMPItem?.UnitPrice ?? 0;
                var plannedQty = item.PPMPItem?.PlannedQuantity ?? 0;
                var qty = allocQty > 0 ? allocQty : plannedQty;
                if (qty <= 0 && unitPrice > 0 && item.EffectiveABC > 0)
                {
                    qty = (int)Math.Round(item.EffectiveABC / unitPrice);
                }
                if (qty <= 0) qty = 1;

                var effectiveStart = item.StartOfProcurementOverride ?? (item.PPMPItem?.ProcurementStartDate.HasValue == true ? item.PPMPItem.ProcurementStartDate.Value.ToDateTime(TimeOnly.MinValue) : null);
                var effectiveEnd = item.EndOfProcurementOverride ?? (item.PPMPItem?.ProcurementEndDate.HasValue == true ? item.PPMPItem.ProcurementEndDate.Value.ToDateTime(TimeOnly.MinValue) : null);

                return new APPItemSummaryResponse
                {
                    Id = item.Id,
                    PPMPItemId = item.PPMPItemId,
                    CSEItemId = item.PPMPItem?.CSEItemId,
                    NonCSEItemId = item.PPMPItem?.NonCSEItemId,
                    IsCSE = item.PPMPItem?.CSEItemId != null || (item.PPMPItem != null && item.PPMPItem.NonCSEItemId == null),
                    IsNonCSE = item.PPMPItem?.NonCSEItemId != null,
                    PPMPItemName = item.PPMPItem?.Name ?? string.Empty,
                    Description = item.PPMPItem?.Description ?? string.Empty,
                    Unit = item.PPMPItem?.Unit ?? string.Empty,
                    Quantity = qty,
                    UnitCost = unitPrice,
                    TotalAmount = item.EffectiveABC,
                    OriginalPPMPBudget = item.OriginalPPMPBudget,
                    EffectiveABC = item.EffectiveABC,
                    EffectiveStartOfProcurement = effectiveStart,
                    EffectiveEndOfProcurement = effectiveEnd,
                    IsABCOverridden = item.EstimatedBudgetOverride.HasValue,
                    IsStartProcurementOverridden = item.StartOfProcurementOverride.HasValue,
                    IsEndProcurementOverridden = item.EndOfProcurementOverride.HasValue,
                    ProcurementModeId = item.ProcurementModeId,
                    ProcurementModeName = item.ProcurementMode?.Name ?? string.Empty,
                    FundSourceId = item.FundSourceId,
                    FundSourceName = item.FundSource?.Name ?? string.Empty,
                    OfficeId = item.OfficeId,
                    OfficeName = item.Office?.Name ?? string.Empty,
                    PAPCode = item.PAPCode,
                    Remarks = item.Remarks,
                    IsEarlyProcurementActivity = item.IsEarlyProcurementActivity,
                    EPARemarks = item.EPARemarks,
                    IsOutsourced = item.IsOutsourced,
                    StartOfProcurementOverride = item.StartOfProcurementOverride,
                    EndOfProcurementOverride = item.EndOfProcurementOverride,
                    EstimatedBudgetOverride = item.EstimatedBudgetOverride,
                    BidEvaluationCriteria = item.BidEvaluationCriteria?.ToString(),
                    ProcurementStrategies = item.ProcurementStrategies?.Select(s => s.ToString()).ToList() ?? [],
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
                };
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
            }).ToList(),
            Signatories = new APPSignatoriesResponse
            {
                PreparedBy = app.APPSignatories.Where(s => !s.IsDeleted && string.Equals(s.RoleKey, "preparedBy", StringComparison.OrdinalIgnoreCase)).OrderBy(s => s.SequenceOrder).Select(s => new APPSignatoryResponse { Id = s.Id, UserId = s.UserId, PersonnelPositionId = s.PersonnelPositionId, Name = s.Name, Position = s.Position, Department = s.Department, SignatureDate = s.SignatureDate }).ToList(),
                ReviewedBy = app.APPSignatories.Where(s => !s.IsDeleted && string.Equals(s.RoleKey, "reviewedBy", StringComparison.OrdinalIgnoreCase)).OrderBy(s => s.SequenceOrder).Select(s => new APPSignatoryResponse { Id = s.Id, UserId = s.UserId, PersonnelPositionId = s.PersonnelPositionId, Name = s.Name, Position = s.Position, Department = s.Department, SignatureDate = s.SignatureDate }).ToList(),
                ApprovedBy = app.APPSignatories.Where(s => !s.IsDeleted && string.Equals(s.RoleKey, "approvedBy", StringComparison.OrdinalIgnoreCase)).OrderBy(s => s.SequenceOrder).Select(s => new APPSignatoryResponse { Id = s.Id, UserId = s.UserId, PersonnelPositionId = s.PersonnelPositionId, Name = s.Name, Position = s.Position, Department = s.Department, SignatureDate = s.SignatureDate }).ToList(),
                CertifiedBy = app.APPSignatories.Where(s => !s.IsDeleted && string.Equals(s.RoleKey, "certifiedBy", StringComparison.OrdinalIgnoreCase)).OrderBy(s => s.SequenceOrder).Select(s => new APPSignatoryResponse { Id = s.Id, UserId = s.UserId, PersonnelPositionId = s.PersonnelPositionId, Name = s.Name, Position = s.Position, Department = s.Department, SignatureDate = s.SignatureDate }).ToList(),
            }
        };

        return ApiResponse<APPResponse>.Success(response);
    }
}
