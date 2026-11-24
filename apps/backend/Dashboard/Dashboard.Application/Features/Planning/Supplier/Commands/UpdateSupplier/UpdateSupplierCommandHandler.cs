using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Supplier.Commands.UpdateSupplier;

public class UpdateSupplierCommandHandler(IUnitOfWork unitOfWork, IFileStorageService fileStorageService)
    : IRequestHandler<UpdateSupplierCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateSupplierCommand request, CancellationToken cancellationToken)
    {
        var updateRequest = request.UpdateSupplier;

        // Validate existing entity
        var entity = await unitOfWork.SupplierRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Supplier not found.");

        // Validate SupplierCategory exists
        _ = await unitOfWork.SupplierCategoryRepository.GetByIdAsync(updateRequest.SupplierCategoryId, cancellationToken)
            ?? throw new NotFoundException("Supplier category not found.");

        // Check for duplicate TIN Number (excluding current supplier)
        if (await unitOfWork.SupplierRepository.ExistsByTINAsync(updateRequest.TINNumber, request.Id, cancellationToken))
            throw new ConflictException($"A supplier with TIN Number '{updateRequest.TINNumber}' already exists.");

        // Check for duplicate Business Permit (excluding current supplier)
        if (await unitOfWork.SupplierRepository.ExistsByBusinessPermitAsync(updateRequest.BusinessPermitNo, request.Id, cancellationToken))
            throw new ConflictException($"A supplier with Business Permit Number '{updateRequest.BusinessPermitNo}' already exists.");

        // Update requirements if provided
        if (updateRequest.Requirements != null)
        {
            var existingRequirements = await unitOfWork.SupplierRequirementRepository.GetBySupplierIdAsync(request.Id, cancellationToken);
            var reqIdsInRequest = updateRequest.Requirements
                .Where(r => r.Id.HasValue && r.Id.Value != Guid.Empty)
                .Select(r => r.Id!.Value)
                .ToHashSet();

            // 1. Remove requirements that are omitted in the request
            var requirementsToRemove = existingRequirements
                .Where(er => !reqIdsInRequest.Contains(er.Id))
                .ToList();

            foreach (var reqToRemove in requirementsToRemove)
            {
                unitOfWork.SupplierRequirementRepository.Remove(reqToRemove);
            }

            // 2. Update existing or add new requirements
            foreach (var req in updateRequest.Requirements)
            {
                if (req.Id.HasValue && req.Id.Value != Guid.Empty)
                {
                    var existing = existingRequirements.FirstOrDefault(er => er.Id == req.Id.Value);
                    if (existing != null)
                    {
                        existing.RequirementName = req.RequirementName;
                        if (req.FileId.HasValue)
                        {
                            var (promotedUrl, _) = await fileStorageService.PromoteFileAsync(req.FileId.Value, cancellationToken);
                            existing.Url = promotedUrl;
                            existing.IsVerified = false; // Reset verification because file was replaced
                        }
                        else if (req.IsVerified.HasValue)
                        {
                            existing.IsVerified = req.IsVerified.Value;
                        }
                        unitOfWork.SupplierRequirementRepository.Update(existing);
                    }
                }
                else
                {
                    string? promotedUrl = req.Url;
                    if (req.FileId.HasValue)
                    {
                        var (url, _) = await fileStorageService.PromoteFileAsync(req.FileId.Value, cancellationToken);
                        promotedUrl = url;
                    }

                    var newReq = new Domain.Entities.Planning.SupplierRequirement
                    {
                        Id = Guid.NewGuid(),
                        SupplierId = entity.Id,
                        RequirementName = req.RequirementName,
                        Url = promotedUrl,
                        IsVerified = false
                    };
                    await unitOfWork.SupplierRequirementRepository.AddAsync(newReq, cancellationToken);
                }
            }
        }

        // Update entity basic fields
        entity.Name = updateRequest.Name;
        entity.BusinessPermitNo = updateRequest.BusinessPermitNo;
        entity.ContactPerson = updateRequest.ContactPerson;
        entity.ContactNumber = updateRequest.ContactNumber;
        entity.Address = updateRequest.Address;
        entity.Email = updateRequest.Email;
        entity.TINNumber = updateRequest.TINNumber;
        entity.PhilGEPSNumber = updateRequest.PhilGEPSNumber;
        entity.IsBlocked = updateRequest.IsBlacklisted;
        entity.Status = updateRequest.Status;
        entity.SupplierCategoryId = updateRequest.SupplierCategoryId;

        unitOfWork.SupplierRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        // Validate supplier status can only be Approved if all mandatory requirements are verified
        if (updateRequest.Status == nameof(SupplierStatusEnum.Approved))
        {
            var allVerified = await unitOfWork.SupplierRequirementRepository.AllMandatoryRequirementsVerifiedAsync(
                request.Id, cancellationToken);

            if (!allVerified)
                throw new ConflictException("Cannot approve supplier. All mandatory requirements must be verified.");
        }

        return ApiResponse<Unit>.Success(Unit.Value, "Supplier updated successfully.");
    }
}
