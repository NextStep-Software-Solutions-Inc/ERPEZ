using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Object.Commands.DeleteObject;

public class DeleteObjectCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteObjectCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteObjectCommand request, CancellationToken cancellationToken)
    {
        var reqObject = await unitOfWork.ObjectRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Object not found.");

        unitOfWork.ObjectRepository.Remove(reqObject);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Object with ID {request.Id} deleted successfully.");
    }
}