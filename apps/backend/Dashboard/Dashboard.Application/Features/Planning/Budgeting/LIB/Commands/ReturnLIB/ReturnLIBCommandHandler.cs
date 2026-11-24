using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.ReturnLIB;

public class ReturnLIBCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUser)
    : IRequestHandler<ReturnLIBCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(ReturnLIBCommand command, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"LIB with ID {command.Id} not found.");

        if (!entity.Status.Equals(nameof(LIBStatus.Submitted), StringComparison.OrdinalIgnoreCase))
        {
            throw new ValidationException($"Cannot return LIB with status '{entity.Status}'. Only Submitted LIBs can be returned.");
        }

        // Layer 3: Workflow Matrix & Position Verification
        if (!currentUser.IsSuperAdmin)
        {
            if (string.IsNullOrWhiteSpace(currentUser.ExternalIdentityId))
            {
                throw new UnauthorizedException("User identity is not authenticated.");
            }

            var user = await unitOfWork.UserRepository.GetByExternalIdentityIdAsync(currentUser.ExternalIdentityId, cancellationToken)
                ?? throw new UnauthorizedException("User personnel record not found in system.");

            var matrices = await unitOfWork.WorkflowMatrixRepository.FindAllAsync(
                w => w.FiscalYearId == entity.FiscalYearId &&
                     w.OfficeId == entity.OfficeId &&
                     (w.DocumentType == "LIB" || w.DocumentType == null) &&
                     !w.IsDeleted,
                cancellationToken);

            var matrix = matrices
                .OrderByDescending(w => w.DocumentType != null)
                .FirstOrDefault()
                ?? throw new ValidationException("No active approval workflow matrix configured for this Office and Fiscal Year.");

            var isFinalApprover = await unitOfWork.PersonnelPositionRepository.HasActiveAssignmentAsync(
                user.Id,
                matrix.FinalApproverPositionId,
                cancellationToken);

            var isRecommendingApprover = await unitOfWork.PersonnelPositionRepository.HasActiveAssignmentAsync(
                user.Id,
                matrix.RecommendingApproverPositionId,
                cancellationToken);

            if (!isFinalApprover && !isRecommendingApprover)
            {
                throw new ForbiddenException("You do not hold the designated Position required to return this Line Item Budget.");
            }
        }

        entity.Status = nameof(LIBStatus.Returned);
        entity.ApprovedDate = null;

        unitOfWork.LineItemBudgetRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "LIB returned successfully.");
    }
}
