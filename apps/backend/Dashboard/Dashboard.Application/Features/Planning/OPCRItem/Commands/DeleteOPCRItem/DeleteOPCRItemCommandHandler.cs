using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItem.Commands.DeleteOPCRItem;

public class DeleteOPCRItemCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteOPCRItemCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteOPCRItemCommand request, CancellationToken cancellationToken)
    {
        var opcrItem = await unitOfWork.OPCRItemRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("OPCR Item not found.");

        unitOfWork.OPCRItemRepository.Remove(opcrItem);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"OPCR Item with ID {request.Id} deleted successfully.");
    }
}
