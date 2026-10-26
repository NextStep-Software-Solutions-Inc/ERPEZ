using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Contracts.Commands.ReturnContract;

public class ReturnContractCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
    : IRequestHandler<ReturnContractCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(ReturnContractCommand request, CancellationToken cancellationToken)
    {
        var contract = await unitOfWork.ContractRepository.GetByIdAsync(request.Id, cancellationToken);
        if (contract == null || contract.IsDeleted)
        {
            return ApiResponse<bool>.Fail("Contract not found.");
        }

        if (contract.Status != ContractStatus.ForApproval)
        {
            return ApiResponse<bool>.Fail($"Contract in status '{contract.Status}' cannot be returned. Must be 'ForApproval'.");
        }

        var remarks = request.Remarks?.Trim();
        if (string.IsNullOrWhiteSpace(remarks) || remarks.Length < 10)
        {
            return ApiResponse<bool>.Fail("Return remarks must be at least 10 characters detailing the reason for return.");
        }

        var actorId = Guid.TryParse(currentUserService.UserId, out var parsedId) ? parsedId : (Guid?)null;
        var actorName = currentUserService.Name ?? currentUserService.Username ?? "System";

        contract.Status = ContractStatus.Returned;
        contract.ReturnRemarks = remarks;
        contract.ReturnedById = actorId;
        contract.ReturnedAt = DateTime.UtcNow;
        contract.UpdatedAt = DateTime.UtcNow;
        contract.UpdatedBy = actorName;

        unitOfWork.ContractRepository.Update(contract);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "Contract returned for revision successfully.");
    }
}
