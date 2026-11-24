using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Contracts.Commands.CancelContract;

public class CancelContractCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
    : IRequestHandler<CancelContractCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(CancelContractCommand request, CancellationToken cancellationToken)
    {
        var contract = await unitOfWork.ContractRepository.GetByIdAsync(request.Id, cancellationToken);
        if (contract == null || contract.IsDeleted)
        {
            return ApiResponse<bool>.Fail("Contract not found.");
        }

        if (contract.Status != ContractStatus.Draft && contract.Status != ContractStatus.Returned)
        {
            return ApiResponse<bool>.Fail($"Contract in status '{contract.Status}' cannot be cancelled. Only Draft or Returned contracts can be cancelled.");
        }

        var actorName = currentUserService.Name ?? currentUserService.Username ?? "System";

        contract.Status = ContractStatus.Cancelled;
        contract.UpdatedAt = DateTime.UtcNow;
        contract.UpdatedBy = actorName;

        unitOfWork.ContractRepository.Update(contract);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "Contract cancelled successfully.");
    }
}
