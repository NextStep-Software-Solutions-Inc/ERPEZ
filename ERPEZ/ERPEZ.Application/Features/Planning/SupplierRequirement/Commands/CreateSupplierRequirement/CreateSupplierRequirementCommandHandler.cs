using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SupplierRequirement.Commands.CreateSupplierRequirement;

public class CreateSupplierRequirementCommandHandler(IUnitOfWork unitOfWork, IFileStorageService fileStorageService)
    : IRequestHandler<CreateSupplierRequirementCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateSupplierRequirementCommand request, CancellationToken cancellationToken)
    {
        // Validate supplier exists
        var supplier = await unitOfWork.SupplierRepository.GetByIdAsync(request.SupplierId, cancellationToken)
            ?? throw new NotFoundException("Supplier not found.");

        string? url = null;
        if (request.FileId.HasValue)
        {
            url = await fileStorageService.PromoteFileAsync(request.FileId.Value);
        }

        var entity = new Domain.Entities.Planning.SupplierRequirement
        {
            SupplierId = request.SupplierId,
            RequirementName = request.RequirementName,
            Url = url,
            IsVerified = request.IsVerified
        };

        await unitOfWork.SupplierRequirementRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "Supplier requirement created successfully.");
    }
}
