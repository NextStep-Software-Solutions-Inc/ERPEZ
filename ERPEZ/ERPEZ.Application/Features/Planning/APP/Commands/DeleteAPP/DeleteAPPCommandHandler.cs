using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APP.Commands.DeleteAPP;

public class DeleteAPPCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteAPPCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(DeleteAPPCommand request, CancellationToken cancellationToken)
    {
        var app = await unitOfWork.APPRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("APP not found.");

        unitOfWork.APPRepository.Remove(app);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "APP deleted successfully.");
    }
}
