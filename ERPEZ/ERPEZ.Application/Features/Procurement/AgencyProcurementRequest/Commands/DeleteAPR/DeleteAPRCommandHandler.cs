using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.DeleteAPR;

public class DeleteAPRCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteAPRCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(DeleteAPRCommand request, CancellationToken cancellationToken)
    {
        var apr = await unitOfWork.APRRepository.GetAPRWithDetailsAsync(request.Id, cancellationToken);
        if (apr is null)
            return ApiResponse<bool>.Fail("APR not found.");

        if (apr.Status != StatusEnum.Draft)
            return ApiResponse<bool>.Fail(
                $"Only APRs in Draft status can be deleted. Current status: {apr.Status}.");

        foreach (var item in apr.APRItems)
        {
            foreach (var milestone in item.APRItemMilestones)
                unitOfWork.APRItemMilestoneRepository.Remove(milestone);

            unitOfWork.APRItemRepository.Remove(item);
        }

        unitOfWork.APRRepository.Remove(apr);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "APR deleted successfully.");
    }
}
