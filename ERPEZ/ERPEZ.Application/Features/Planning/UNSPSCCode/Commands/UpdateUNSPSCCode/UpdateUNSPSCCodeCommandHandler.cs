using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UNSPSCCode.Commands.UpdateUNSPSCCode;

public class UpdateUNSPSCCodeCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateUNSPSCCodeCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateUNSPSCCodeCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.UNSPSCCodeRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("UNSPSC code not found.");

        if (!string.IsNullOrEmpty(request.Code))
        {
            // Check for duplicates
            var existing = await unitOfWork.UNSPSCCodeRepository.FindAsync(
                x => x.Code == request.Code && x.Id != request.Id && !x.IsDeleted,
                cancellationToken
            );

            if (existing != null)
                throw new ConflictException($"UNSPSC code '{request.Code}' already exists.");

            entity.Code = request.Code;
        }

        if (!string.IsNullOrEmpty(request.Name))
            entity.Name = request.Name;

        if (request.Level.HasValue)
        {
            // Validate level
            if (request.Level.Value < 1 || request.Level.Value > 4)
                throw new ValidationException("Level must be between 1 and 4.");

            entity.Level = request.Level.Value;
        }

        if (request.ParentId.HasValue)
        {
            // Validate parent exists
            var parent = await unitOfWork.UNSPSCCodeRepository.GetByIdAsync(request.ParentId.Value, cancellationToken)
                ?? throw new NotFoundException("Parent UNSPSC code not found.");

            // Prevent circular reference
            if (request.ParentId.Value == request.Id)
                throw new ConflictException("UNSPSC code cannot be its own parent.");

            // Validate parent level
            if (parent.Level != entity.Level - 1)
                throw new ValidationException($"Parent must be Level {entity.Level - 1} for a Level {entity.Level} code.");

            entity.ParentId = request.ParentId.Value;
        }

        unitOfWork.UNSPSCCodeRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "UNSPSC code updated successfully.");
    }
}
