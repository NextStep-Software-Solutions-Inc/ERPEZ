using ERPEZ.Domain.Interfaces;
using ERPEZ.Application.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SupplierRequirement.Commands.UpdateSupplierRequirement;

public class UpdateSupplierRequirementCommandHandler(IUnitOfWork unitOfWork, IFileStorageService fileStorageService)
    : IRequestHandler<UpdateSupplierRequirementCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateSupplierRequirementCommand request, CancellationToken cancellationToken)
    {
        var updateRequest = request.UpdateSupplierRequirement;

        var entity = await unitOfWork.SupplierRequirementRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Supplier requirement not found.");

        entity.RequirementName = updateRequest.RequirementName;
        entity.IsVerified = updateRequest.IsVerified;

        if (updateRequest.FileId.HasValue)
        {
            var (promotedUrl, _) = await fileStorageService.PromoteFileAsync(updateRequest.FileId.Value, cancellationToken);
            
            // Fix the casing here and apply the new file path!
            entity.Url = promotedUrl; 
        }

        unitOfWork.SupplierRequirementRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Supplier requirement updated successfully.");
    }
}
