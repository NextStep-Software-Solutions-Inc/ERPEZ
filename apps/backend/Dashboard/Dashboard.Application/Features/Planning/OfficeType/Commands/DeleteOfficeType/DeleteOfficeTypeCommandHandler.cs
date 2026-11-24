using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OfficeType.Commands.DeleteOfficeType;

public class DeleteOfficeTypeCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<DeleteOfficeTypeCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteOfficeTypeCommand request, CancellationToken cancellationToken)
    {
        var officeType = await unitOfWork.OfficeTypeRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("OfficeType not found.");

        unitOfWork.OfficeTypeRepository.Remove(officeType);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "OfficeType deleted successfully.");
    }
}
