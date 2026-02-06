using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PositionType.Commands.DeletePositionType;

public class DeletePositionTypeCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeletePositionTypeCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeletePositionTypeCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.PositionTypeRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"Position Type with ID '{request.Id}' not found.");

        unitOfWork.PositionTypeRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}
