using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DocumentProfile.Commands.DeleteDocumentProfile;

public class DeleteDocumentProfileCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteDocumentProfileCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        DeleteDocumentProfileCommand request, CancellationToken cancellationToken)
    {
        var profile = await unitOfWork.DocumentProfileRepository
                          .GetByIdWithItemsAsync(request.Id, cancellationToken)
                      ?? throw new NotFoundException("Document profile not found.");

        // Cascade-remove the profile items first, then the profile
        unitOfWork.DocumentProfileItemRepository.RemoveRange(profile.DocumentProfileItems);
        unitOfWork.DocumentProfileRepository.Remove(profile);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Document profile deleted successfully.");
    }
}