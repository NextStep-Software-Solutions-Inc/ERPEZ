using ERPEZ.Application.Features.Planning.Supplier.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Supplier.Commands.PatchSupplier;

public class PatchSupplierCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<PatchSupplierCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(PatchSupplierCommand request, CancellationToken cancellationToken)
    {
        var patch = request.PatchSupplier;

        var entity = await unitOfWork.SupplierRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Supplier not found.");

        if (patch.Status != null)
        {
            if (!Enum.TryParse<SupplierStatusEnum>(patch.Status, true, out var statusEnum))
                throw new ValidationException("Invalid supplier status.");

            var mappedStatus = statusEnum.ToString();

            if (mappedStatus == nameof(SupplierStatusEnum.Approved))
            {
                var allVerified = await unitOfWork.SupplierRequirementRepository.AllMandatoryRequirementsVerifiedAsync(request.Id, cancellationToken);
                if (!allVerified)
                    throw new ConflictException("Cannot approve supplier. All mandatory requirements must be verified.");
            }

            entity.Status = mappedStatus;
        }

        if (patch.StatusNote != null)
        {
            entity.StatusNote = patch.StatusNote;
        }

        if (patch.IsBlocked.HasValue)
        {
            entity.IsBlocked = patch.IsBlocked.Value;
        }

        if (patch.Status == null && patch.StatusNote == null && patch.IsBlocked == null)
        {
            return ApiResponse<Unit>.Success(Unit.Value, "No changes were applied to the supplier.");
        }

        unitOfWork.SupplierRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Supplier status and blocking values updated successfully.");
    }
}
