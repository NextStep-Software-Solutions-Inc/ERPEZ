using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.UpdateDirectContracting;

public class UpdateDirectContractingCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateDirectContractingCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateDirectContractingCommand command, CancellationToken cancellationToken)
    {
        var dc = await unitOfWork.DirectContractingRepository.GetByIdAsync(command.Id, cancellationToken);
        if (dc == null)
        {
            return ApiResponse<Unit>.Fail("Direct Contracting request not found.");
        }

        // Only allow edits when in Draft status
        if (dc.Status != DirectContractingStatusEnum.DRAFT)
        {
            return ApiResponse<Unit>.Fail($"Direct Contracting requests can only be updated when in DRAFT status. Current status is {dc.Status}.");
        }

        // Validate Supplier exists and is not blocked
        var supplier = await unitOfWork.SupplierRepository.GetByIdAsync(command.Request.ExclusiveSupplierId, cancellationToken);
        if (supplier == null)
        {
            return ApiResponse<Unit>.Fail("Supplier not found.");
        }
        if (supplier.IsBlocked)
        {
            return ApiResponse<Unit>.Fail("Selected supplier is blocked from new procurement activities.");
        }

        // Update properties
        dc.Name = command.Request.Name;
        dc.ExclusiveSupplierId = command.Request.ExclusiveSupplierId;
        dc.SubmissionDeadline = command.Request.SubmissionDeadline;

        unitOfWork.DirectContractingRepository.Update(dc);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Direct Contracting request updated successfully.");
    }
}
