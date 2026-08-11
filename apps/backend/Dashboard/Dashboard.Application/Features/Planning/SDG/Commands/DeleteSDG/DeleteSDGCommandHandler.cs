using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SDG.Commands.DeleteSDG;

public class DeleteSDGCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteSDGCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteSDGCommand request, CancellationToken cancellationToken)
    {
        var sdg = await unitOfWork.SDGRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"SDG with ID {request.Id} not found.");

        unitOfWork.SDGRepository.Remove(sdg);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "SDG deleted successfully.");
    }
}
