using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.MasterDocumentType.Commands.DeleteMasterDocumentType;

public class DeleteMasterDocumentTypeCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteMasterDocumentTypeCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        DeleteMasterDocumentTypeCommand request, CancellationToken cancellationToken)
    {
        // Load with nav props to check referential integrity before deletion
        var entity = await unitOfWork.MasterDocumentTypeRepository
                         .GetByIdWithItemsAsync(request.Id, cancellationToken)
                     ?? throw new NotFoundException("Document type not found.");

        if (entity.DocumentProfileItems.Count > 0)
            throw new ConflictException(
                "Cannot delete a document type that is referenced in one or more profiles. " +
                "Remove it from those profiles first.");

        if (entity.ProjectDocumentChecklists.Any(c => !c.IsDeleted))
            throw new ConflictException(
                "Cannot delete a document type that is referenced in active project checklists.");

        unitOfWork.MasterDocumentTypeRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Document type deleted successfully.");
    }
}