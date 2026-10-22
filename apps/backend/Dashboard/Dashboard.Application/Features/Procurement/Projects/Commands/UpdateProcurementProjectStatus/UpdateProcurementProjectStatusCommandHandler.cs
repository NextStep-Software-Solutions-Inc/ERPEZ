using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.UpdateProcurementProjectStatus;

public class UpdateProcurementProjectStatusCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateProcurementProjectStatusCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateProcurementProjectStatusCommand request, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository.GetByIdAsync(request.Id, cancellationToken);
        if (project == null)
        {
            return ApiResponse<Unit>.Fail("Procurement project not found.");
        }

        if (!Enum.TryParse<StatusEnum>(request.StatusRequest.Status, true, out var newStatusEnum) ||
            !(newStatusEnum is StatusEnum.Draft or StatusEnum.Submitted or StatusEnum.Returned or StatusEnum.Approved))
        {
            return ApiResponse<Unit>.Fail("Invalid status. Supported statuses are Draft, Submitted, Returned, Approved.");
        }

        var currentStatusEnum = StatusEnum.Draft;
        if (!string.IsNullOrEmpty(project.Status) && Enum.TryParse<StatusEnum>(project.Status, true, out var parsedCurrent))
        {
            currentStatusEnum = parsedCurrent;
        }

        if (!IsValidTransition(currentStatusEnum, newStatusEnum))
        {
            return ApiResponse<Unit>.Fail($"Cannot transition from '{currentStatusEnum}' status to '{newStatusEnum}'.");
        }

        var resolutions = await unitOfWork.BACResolutionRepository.ToListAsync(
            unitOfWork.BACResolutionRepository.Query(r => r.ProcurementProjectId == project.Id),
            cancellationToken);

        // Under RA 12009 (NGPA), Mode Recommendation BAC Resolutions (procurement-mode-recommendation)
        // represent the pre-procurement phase where the BAC recommends the modality to the HoPE.
        // An RFQ cannot and must not be required before this mode recommendation is approved,
        // because the legal authority to issue an RFQ stems from the approved BAC Resolution.
        // Only post-canvassing Award Recommendations (award-recommendation) require completed RFQs.
        var isModeRecommendation = resolutions.Count == 0 || resolutions.Any(r =>
            string.Equals(r.ResolutionType, "procurement-mode-recommendation", StringComparison.OrdinalIgnoreCase) ||
            string.IsNullOrEmpty(r.ResolutionType));

        if (!isModeRecommendation && newStatusEnum is StatusEnum.Approved)
        {
            var mode = project.ProcurementModeId.HasValue 
                ? await unitOfWork.ProcurementModeRepository.GetByIdAsync(project.ProcurementModeId.Value, cancellationToken)
                : null;

            var isSvp = (mode != null && (mode.Name.Contains("Small Value", StringComparison.OrdinalIgnoreCase) ||
                                          mode.Name.Contains("SVP", StringComparison.OrdinalIgnoreCase) ||
                                          mode.Name.Contains("53.9", StringComparison.OrdinalIgnoreCase)))
                        || (project.ContractNo != null && project.ContractNo.Contains("SVP", StringComparison.OrdinalIgnoreCase));

            if (isSvp && project.ConsolidatedPRId.HasValue)
            {
                var hasRfq = await unitOfWork.RFQRepository.Query()
                    .AnyAsync(r => r.ConsolidatedPRId == project.ConsolidatedPRId.Value && !r.IsDeleted, cancellationToken);
                if (!hasRfq)
                {
                    return ApiResponse<Unit>.Fail("Cannot approve award for Small Value Procurement project: An associated Request for Quotation (RFQ) with completed quotations is required.");
                }
            }
        }

        project.Status = newStatusEnum.ToString();

        unitOfWork.ProcurementProjectRepository.Update(project);

        foreach (var res in resolutions)
        {
            res.Status = newStatusEnum.ToString();
            unitOfWork.BACResolutionRepository.Update(res);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Procurement project status updated to {newStatusEnum} successfully.");
    }

    private static bool IsValidTransition(StatusEnum currentStatus, StatusEnum newStatus)
    {
        if (currentStatus == newStatus)
            return true;

        return (currentStatus, newStatus) switch
        {
            (StatusEnum.Draft, StatusEnum.Submitted) => true,
            (StatusEnum.Submitted, StatusEnum.Approved) => true,
            (StatusEnum.Submitted, StatusEnum.Returned) => true,
            (StatusEnum.Returned, StatusEnum.Draft) => true,
            (StatusEnum.Returned, StatusEnum.Submitted) => true,
            _ => false
        };
    }
}

