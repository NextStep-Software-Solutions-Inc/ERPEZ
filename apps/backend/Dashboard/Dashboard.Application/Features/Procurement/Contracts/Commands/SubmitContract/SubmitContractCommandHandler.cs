using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Contracts.Commands.SubmitContract;

public class SubmitContractCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
    : IRequestHandler<SubmitContractCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(SubmitContractCommand request, CancellationToken cancellationToken)
    {
        var contract = await unitOfWork.ContractRepository.GetByIdAsync(request.Id, cancellationToken);
        if (contract == null || contract.IsDeleted)
        {
            return ApiResponse<bool>.Fail("Contract not found.");
        }

        if (contract.Status != ContractStatus.Draft && contract.Status != ContractStatus.Returned)
        {
            return ApiResponse<bool>.Fail($"Contract in status '{contract.Status}' cannot be submitted for approval. Must be Draft or Returned.");
        }

        var actorId = Guid.TryParse(currentUserService.UserId, out var parsedId) ? parsedId : (Guid?)null;
        var actorName = currentUserService.Name ?? currentUserService.Username ?? "System";

        contract.Status = ContractStatus.ForApproval;
        contract.SubmittedById = actorId;
        contract.SubmittedAt = DateTime.UtcNow;
        contract.UpdatedAt = DateTime.UtcNow;
        contract.UpdatedBy = actorName;

        unitOfWork.ContractRepository.Update(contract);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "Contract submitted for internal review and approval successfully.");
    }
}
