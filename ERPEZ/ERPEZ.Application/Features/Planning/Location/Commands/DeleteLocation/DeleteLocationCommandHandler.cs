using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Location.Commands.DeleteLocation;

public class DeleteLocationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteLocationCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteLocationCommand request, CancellationToken cancellationToken)
    {
        var location = await unitOfWork.LocationRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Location not found.");

        unitOfWork.LocationRepository.Remove(location);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Location with ID {request.Id} deleted successfully.");
    }
}
