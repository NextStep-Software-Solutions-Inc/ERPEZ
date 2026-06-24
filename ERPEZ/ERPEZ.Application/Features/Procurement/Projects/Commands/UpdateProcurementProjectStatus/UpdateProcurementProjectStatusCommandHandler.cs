using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

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

        project.Status = newStatusEnum.ToString();

        unitOfWork.ProcurementProjectRepository.Update(project);
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

