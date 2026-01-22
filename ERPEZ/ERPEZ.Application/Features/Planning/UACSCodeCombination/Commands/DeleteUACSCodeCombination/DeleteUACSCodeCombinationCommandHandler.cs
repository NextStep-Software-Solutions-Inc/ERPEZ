using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeCombination.Commands.DeleteUACSCodeCombination;

public class DeleteUACSCodeCombinationCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<DeleteUACSCodeCombinationCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteUACSCodeCombinationCommand request, CancellationToken cancellationToken)
    {
        var codeCombination = await unitOfWork.UACSCodeCombinationRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("UACS code combination not found.");

        unitOfWork.UACSCodeCombinationRepository.Remove(codeCombination);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"UACS code combination with ID {request.Id} deleted successfully.");
    }
}
