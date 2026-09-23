using ERPEZ.Domain.Enums;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Supplier.Commands.CreateSupplierWithRequirements;

public class CreateSupplierWithRequirementsCommandHandler(IUnitOfWork unitOfWork, IFileStorageService fileStorageService)
    : IRequestHandler<CreateSupplierWithRequirementsCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateSupplierWithRequirementsCommand request, CancellationToken cancellationToken)
    {
        var createRequest = request.CreateSupplierRequest;

        // Validate SupplierCategory exists
        _ = await unitOfWork.SupplierCategoryRepository.GetByIdAsync(createRequest.SupplierCategoryId, cancellationToken)
            ?? throw new NotFoundException("Supplier category not found.");

        // Check for duplicate TIN Number
        if (await unitOfWork.SupplierRepository.ExistsByTINAsync(createRequest.TINNumber, null, cancellationToken))
            throw new ConflictException($"A supplier with TIN Number '{createRequest.TINNumber}' already exists.");

        // Check for duplicate Business Permit
        if (await unitOfWork.SupplierRepository.ExistsByBusinessPermitAsync(createRequest.BusinessPermitNo, null, cancellationToken))
            throw new ConflictException($"A supplier with Business Permit Number '{createRequest.BusinessPermitNo}' already exists.");

        var supplier = new Domain.Entities.Planning.Supplier
        {
            Id = Guid.NewGuid(),
            Name = createRequest.Name,
            BusinessPermitNo = createRequest.BusinessPermitNo,
            ContactPerson = createRequest.ContactPerson,
            ContactNumber = createRequest.ContactNumber,
            Address = createRequest.Address,
            Email = createRequest.Email,
            TINNumber = createRequest.TINNumber,
            PhilGEPSNumber = createRequest.PhilGEPSNumber,
            SupplierCategoryId = createRequest.SupplierCategoryId,
            Status = nameof(SupplierStatusEnum.Pending),
            IsBlocked = false
        };

        // Create supplier requirements
        var promotedFileIds = new List<Guid>();
        try
        {
            if (createRequest.Requirements.Count > 0)
            {
                var requirements = new List<Domain.Entities.Planning.SupplierRequirement>();

                foreach (var req in createRequest.Requirements)
                {
                    string? promotedUrl = null;
                    if (req.FileId.HasValue)
                    {
                        var (url, _) = await fileStorageService.PromoteFileAsync(req.FileId.Value, cancellationToken);
                        promotedUrl = url;
                        promotedFileIds.Add(req.FileId.Value);
                    }

                    requirements.Add(new Domain.Entities.Planning.SupplierRequirement
                    {
                        Id = Guid.NewGuid(),
                        SupplierId = supplier.Id,
                        RequirementName = req.RequirementName,
                        Url = promotedUrl,
                        IsVerified = false
                    });
                }
                supplier.SupplierRequirements = requirements;
            }

            await unitOfWork.SupplierRepository.AddAsync(supplier, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return ApiResponse<Guid>.Success(supplier.Id, "Supplier and requirements created successfully.");
        }
        catch
        {
            // Clean up any promoted files if creation fails to prevent storage exhaustion
            foreach (var promotedId in promotedFileIds)
            {
                try
                {
                    await fileStorageService.DeletePermanentAsync(promotedId, cancellationToken);
                }
                catch
                {
                    // Ignore secondary errors during cleanup
                }
            }
            throw;
        }
    }
}
