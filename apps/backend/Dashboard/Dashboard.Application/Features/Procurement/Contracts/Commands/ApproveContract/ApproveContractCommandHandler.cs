using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Contracts.Commands.ApproveContract;

public class ApproveContractCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
    : IRequestHandler<ApproveContractCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(ApproveContractCommand request, CancellationToken cancellationToken)
    {
        var contract = await unitOfWork.ContractRepository.GetByIdAsync(request.Id, cancellationToken);
        if (contract == null || contract.IsDeleted)
        {
            return ApiResponse<bool>.Fail("Contract not found.");
        }

        if (contract.Status != ContractStatus.ForApproval)
        {
            return ApiResponse<bool>.Fail($"Contract in status '{contract.Status}' cannot be approved. Must be 'ForApproval'.");
        }

        var actorId = Guid.TryParse(currentUserService.UserId, out var parsedId) ? parsedId : (Guid?)null;
        var actorName = currentUserService.Name ?? currentUserService.Username ?? "System";

        contract.Status = ContractStatus.Approved;
        contract.ApprovedById = actorId;
        contract.ApprovedByName = actorName;
        contract.ApprovedAt = DateTime.UtcNow;
        contract.ApprovalRemarks = request.Remarks;
        contract.UpdatedAt = DateTime.UtcNow;
        contract.UpdatedBy = actorName;

        unitOfWork.ContractRepository.Update(contract);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "Contract draft approved successfully.");
    }
}
