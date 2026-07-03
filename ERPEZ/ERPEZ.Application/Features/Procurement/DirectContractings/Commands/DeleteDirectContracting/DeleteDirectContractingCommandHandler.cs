using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.DeleteDirectContracting;

public class DeleteDirectContractingCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteDirectContractingCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteDirectContractingCommand command, CancellationToken cancellationToken)
    {
        var dc = await unitOfWork.DirectContractingRepository.GetByIdAsync(command.Id, cancellationToken);
        if (dc == null)
        {
            return ApiResponse<Unit>.Fail("Direct Contracting request not found.");
        }

        // Validate that requests can only be deleted when in DRAFT status
        if (dc.Status != DirectContractingStatusEnum.DRAFT)
        {
            return ApiResponse<Unit>.Fail($"Direct Contracting requests can only be deleted when in DRAFT status. Current status is {dc.Status}.");
        }

        unitOfWork.DirectContractingRepository.Remove(dc);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Direct Contracting request deleted successfully.");
    }
}
