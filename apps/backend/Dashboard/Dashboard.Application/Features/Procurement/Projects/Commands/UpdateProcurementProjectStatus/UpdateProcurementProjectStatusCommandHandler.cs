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

        // Business Rule: Small Value Procurement (SVP) projects submitted or approved/posted for suppliers must have an associated RFQ
        if (newStatusEnum is StatusEnum.Submitted or StatusEnum.Approved)
        {
            var mode = project.ProcurementModeId.HasValue 
                ? await unitOfWork.ProcurementModeRepository.GetByIdAsync(project.ProcurementModeId.Value, cancellationToken)
                : null;

            var isSvp = (mode != null && (mode.Name.Contains("Small Value", StringComparison.OrdinalIgnoreCase) ||
                                          mode.Name.Contains("SVP", StringComparison.OrdinalIgnoreCase) ||
                                          mode.Name.Contains("53.9", StringComparison.OrdinalIgnoreCase)))
                        || (project.ContractNo != null && project.ContractNo.Contains("SVP", StringComparison.OrdinalIgnoreCase));

            if (isSvp)
            {
                var hasRfq = project.ConsolidatedPRId.HasValue && await unitOfWork.RFQRepository.Query()
                    .AnyAsync(r => r.ConsolidatedPRId == project.ConsolidatedPRId.Value && !r.IsDeleted, cancellationToken);
                if (!hasRfq)
                {
                    return ApiResponse<Unit>.Fail("Cannot submit or approve project: Small Value Procurement projects must have an associated Request for Quotation (RFQ) before submitting or posting.");
                }
            }
        }

        project.Status = newStatusEnum.ToString();

        unitOfWork.ProcurementProjectRepository.Update(project);

        var resolutions = await unitOfWork.BACResolutionRepository.ToListAsync(
            unitOfWork.BACResolutionRepository.Query(r => r.ProcurementProjectId == project.Id),
            cancellationToken);
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

