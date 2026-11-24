using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementCategory.Commands.UpdateProcurementCategory;

public class UpdateProcurementCategoryCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateProcurementCategoryCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateProcurementCategoryCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ProcurementCategoryRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Procurement category not found.");

        if (!string.IsNullOrEmpty(request.Name))
        {
            // Check for duplicates
            var existing = await unitOfWork.ProcurementCategoryRepository.FindAsync(
                x => x.Name == request.Name && x.Id != request.Id && !x.IsDeleted,
                cancellationToken
            );

            if (existing != null)
                throw new ConflictException($"Procurement category with name '{request.Name}' already exists.");

            entity.Name = request.Name;
        }

        if (request.Description != null)
            entity.Description = request.Description;

        unitOfWork.ProcurementCategoryRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Procurement category updated successfully.");
    }
}
