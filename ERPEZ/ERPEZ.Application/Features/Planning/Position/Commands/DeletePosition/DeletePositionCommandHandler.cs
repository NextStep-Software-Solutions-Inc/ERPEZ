using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Position.Commands.DeletePosition;

public class DeletePositionCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeletePositionCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeletePositionCommand request, CancellationToken cancellationToken)
    {
        var position = await unitOfWork.PositionRepository.GetByIdAsync(request.Id, cancellationToken);

        if (position == null)
            throw new NotFoundException($"Position with ID '{request.Id}' not found.");

        unitOfWork.PositionRepository.Remove(position);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}
