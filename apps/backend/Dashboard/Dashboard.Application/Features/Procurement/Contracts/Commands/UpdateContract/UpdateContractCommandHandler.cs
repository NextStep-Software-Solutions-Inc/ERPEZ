using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Contracts.Commands.UpdateContract;

public class UpdateContractCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
    : IRequestHandler<UpdateContractCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(UpdateContractCommand request, CancellationToken cancellationToken)
    {
        var contract = await unitOfWork.ContractRepository.GetByIdAsync(request.Id, cancellationToken);
        if (contract == null || contract.IsDeleted)
        {
            return ApiResponse<bool>.Fail("Contract not found.");
        }

        if (contract.Status != ContractStatus.Draft && contract.Status != ContractStatus.Returned)
        {
            return ApiResponse<bool>.Fail($"Contract in status '{contract.Status}' cannot be updated. Only Draft or Returned contracts can be modified.");
        }

        if (!string.IsNullOrWhiteSpace(request.ContractNumber))
        {
            var newNumber = request.ContractNumber.Trim();
            if (!string.Equals(contract.ContractNumber, newNumber, StringComparison.OrdinalIgnoreCase))
            {
                var duplicate = await unitOfWork.ContractRepository.FindAsync(
                    c => c.Id != contract.Id && c.ContractNumber == newNumber && c.Status != ContractStatus.Cancelled && !c.IsDeleted,
                    cancellationToken
                );
                if (duplicate != null)
                {
                    return ApiResponse<bool>.Fail($"Contract number '{newNumber}' is already in use.");
                }

                contract.ContractNumber = newNumber;
            }
        }

        if (request.ContractDate != default)
        {
            contract.ContractDate = request.ContractDate;
        }

        if (request.Description != null)
        {
            contract.Description = request.Description;
        }

        var actorName = currentUserService.Name ?? currentUserService.Username ?? "System";
        contract.UpdatedAt = DateTime.UtcNow;
        contract.UpdatedBy = actorName;

        unitOfWork.ContractRepository.Update(contract);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "Contract updated successfully.");
    }
}
