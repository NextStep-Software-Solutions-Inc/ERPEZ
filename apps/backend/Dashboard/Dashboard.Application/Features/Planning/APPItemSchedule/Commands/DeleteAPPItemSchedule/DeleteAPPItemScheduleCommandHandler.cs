using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APPItemSchedule.Commands.DeleteAPPItemSchedule;

public class DeleteAPPItemScheduleCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteAPPItemScheduleCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(DeleteAPPItemScheduleCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.APPItemScheduleRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("APP item schedule not found.");

        unitOfWork.APPItemScheduleRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "APP item schedule deleted successfully.");
    }
}
