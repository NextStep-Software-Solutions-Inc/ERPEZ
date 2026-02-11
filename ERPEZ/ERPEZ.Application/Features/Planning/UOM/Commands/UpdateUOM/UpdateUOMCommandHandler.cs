using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UOM.Commands.UpdateUOM;

public class UpdateUOMCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateUOMCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateUOMCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.UOMRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("UOM not found.");

        if (!string.IsNullOrEmpty(request.Name))
        {
            // Check for duplicates
            var existing = await unitOfWork.UOMRepository.FindAsync(
                x => x.Name == request.Name && x.Id != request.Id && !x.IsDeleted,
                cancellationToken
            );

            if (existing != null)
                throw new ConflictException($"UOM with name '{request.Name}' already exists.");

            entity.Name = request.Name;
        }

        if (!string.IsNullOrEmpty(request.Code))
        {
            // Check for duplicate code
            var existing = await unitOfWork.UOMRepository.FindAsync(
                x => x.Code == request.Code && x.Id != request.Id && !x.IsDeleted,
                cancellationToken
            );

            if (existing != null)
                throw new ConflictException($"UOM with code '{request.Code}' already exists.");

            entity.Code = request.Code;
        }

        if (request.ConversionFactor.HasValue)
            entity.ConversionFactor = request.ConversionFactor;

        if (request.ParentId.HasValue)
        {
            // Validate parent exists
            var parent = await unitOfWork.UOMRepository.GetByIdAsync(request.ParentId.Value, cancellationToken)
                ?? throw new NotFoundException("Parent UOM not found.");

            // Prevent circular reference
            if (request.ParentId.Value == request.Id)
                throw new ConflictException("UOM cannot be its own parent.");

            entity.ParentId = request.ParentId.Value;
        }

        unitOfWork.UOMRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "UOM updated successfully.");
    }
}
