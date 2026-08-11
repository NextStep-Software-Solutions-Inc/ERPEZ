using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DocumentProfile.Commands.UpdateDocumentProfile;

public class UpdateDocumentProfileCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateDocumentProfileCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        UpdateDocumentProfileCommand request, CancellationToken cancellationToken)
    {
        var profile = await unitOfWork.DocumentProfileRepository
                          .GetByIdWithItemsAsync(request.Id, cancellationToken)
                      ?? throw new NotFoundException("Document profile not found.");

        foreach (var item in request.Items)
            _ = await unitOfWork.MasterDocumentTypeRepository
                    .GetByIdAsync(item.MasterDocumentTypeId, cancellationToken)
                ?? throw new NotFoundException(
                    $"Master document type '{item.MasterDocumentTypeId}' not found.");

        // Replace all items (delete-then-insert pattern, consistent with KPIMeasurement approach)
        unitOfWork.DocumentProfileItemRepository.RemoveRange(profile.DocumentProfileItems);

        var newItems = request.Items.Select(i => new DocumentProfileItem
        {
            Id                   = Guid.NewGuid(),
            DocumentProfileId    = profile.Id,
            MasterDocumentTypeId = i.MasterDocumentTypeId,
            OrderIndex           = i.OrderIndex,
            CreatedAt            = DateTime.UtcNow
        }).ToList();

        await unitOfWork.DocumentProfileItemRepository.AddRangeAsync(newItems, cancellationToken);

        profile.Name                = request.Name;
        profile.Description         = request.Description;
        profile.ProcurementCategory = request.ProcurementCategory;
        profile.UpdatedAt           = DateTime.UtcNow;

        unitOfWork.DocumentProfileRepository.Update(profile);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Document profile updated successfully.");
    }
}