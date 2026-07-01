using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DocumentProfile.Commands.CreateDocumentProfile;

public class CreateDocumentProfileCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateDocumentProfileCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        CreateDocumentProfileCommand request, CancellationToken cancellationToken)
    {
        // Validate every referenced document type exists
        foreach (var item in request.Items)
        {
            _ = await unitOfWork.MasterDocumentTypeRepository
                    .GetByIdAsync(item.MasterDocumentTypeId, cancellationToken)
                ?? throw new NotFoundException(
                    $"Master document type '{item.MasterDocumentTypeId}' not found.");
        }

        var profileId = Guid.NewGuid();
        var profile = new Domain.Entities.Procurement.DocumentProfile
        {
            Id                  = profileId,
            Name                = request.Name,
            Description         = request.Description,
            ProcurementCategory = request.ProcurementCategory,
            CreatedAt           = DateTime.UtcNow,
            DocumentProfileItems = request.Items.Select(i => new DocumentProfileItem
            {
                Id                   = Guid.NewGuid(),
                DocumentProfileId    = profileId,
                MasterDocumentTypeId = i.MasterDocumentTypeId,
                OrderIndex           = i.OrderIndex,
                CreatedAt            = DateTime.UtcNow
            }).ToList()
        };

        await unitOfWork.DocumentProfileRepository.AddAsync(profile, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(profile.Id, "Document profile created successfully.");
    }
}