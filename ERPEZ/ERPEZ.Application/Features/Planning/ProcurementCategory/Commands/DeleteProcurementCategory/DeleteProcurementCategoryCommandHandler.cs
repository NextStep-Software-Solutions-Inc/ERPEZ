using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.ProcurementCategory.Commands.DeleteProcurementCategory;

public class DeleteProcurementCategoryCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteProcurementCategoryCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteProcurementCategoryCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ProcurementCategoryRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Procurement category not found.");

        // Check if in use
        var hasReferences = await unitOfWork.ProcurementModeRepository.Query()
            .AnyAsync(pm => pm.ProcurementCategoryId == request.Id, cancellationToken);

        if (hasReferences)
            throw new ConflictException("Cannot delete procurement category that is assigned to procurement modes.");

        unitOfWork.ProcurementCategoryRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Procurement category deleted successfully.");
    }
}
