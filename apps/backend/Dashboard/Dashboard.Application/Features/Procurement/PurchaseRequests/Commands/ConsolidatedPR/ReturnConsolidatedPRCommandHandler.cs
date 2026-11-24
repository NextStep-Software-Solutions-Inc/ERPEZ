// ReturnConsolidatedPRCommandHandler.cs
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.ConsolidatedPR;

public class ReturnConsolidatedPRCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<ReturnConsolidatedPRCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        ReturnConsolidatedPRCommand command, CancellationToken cancellationToken)
    {
        var cpr = await unitOfWork.ConsolidatedPRRepository.GetCPRWithDetailsAsync(
            command.Id, cancellationToken)
            ?? throw new NotFoundException($"Consolidated PR with ID {command.Id} not found.");

        if (cpr.Status != StatusEnum.Submitted)
            throw new ValidationException("Only Submitted Consolidated PRs can be returned.");

        cpr.Status  = StatusEnum.Returned;
        cpr.Remarks = command.Dto.Remarks;

        unitOfWork.ConsolidatedPRRepository.Update(cpr);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Consolidated PR returned for revision.");
    }
}