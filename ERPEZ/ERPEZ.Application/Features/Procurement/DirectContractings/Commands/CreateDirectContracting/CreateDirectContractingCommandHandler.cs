using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

using ERPEZ.Application.Interfaces;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.CreateDirectContracting;

public class CreateDirectContractingCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    : IRequestHandler<CreateDirectContractingCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateDirectContractingCommand request, CancellationToken cancellationToken)
    {
        // 1. Validate BAC Project exists
        var bacProject = await unitOfWork.ProcurementProjectRepository
            .FindAsync(p => p.Id == request.BACProjectId, cancellationToken);

        if (bacProject == null)
        {
            return ApiResponse<Guid>.Fail("BAC Project not found.");
        }

        // 2. Validate Supplier exists and is not blocked
        var supplier = await unitOfWork.SupplierRepository.GetByIdAsync(request.ExclusiveSupplierId, cancellationToken);
        if (supplier == null)
        {
            return ApiResponse<Guid>.Fail("Supplier not found.");
        }
        if (supplier.IsBlocked)
        {
            return ApiResponse<Guid>.Fail("Selected supplier is blocked from new procurement activities.");
        }

        // 3. Single Supplier Rule validation: Ensure no other Direct Contracting is linked to this BAC Project
        var existingDC = await unitOfWork.DirectContractingRepository
            .FindAsync(dc => dc.BACProjectId == request.BACProjectId, cancellationToken);

        if (existingDC != null)
        {
            return ApiResponse<Guid>.Fail($"A Direct Contracting request ({existingDC.DCNumber}) has already been linked to this BAC Project.");
        }

        // 4. Calculate Total ABC derived from the project
        if (bacProject.ABC <= 0)
        {
            return ApiResponse<Guid>.Fail("Cannot create Direct Contracting: Procurement Project ABC is missing or zero.");
        }
        decimal totalAbc = bacProject.ABC;

        // 5. Validate DC Number is unique
        var duplicateDcNumber = await unitOfWork.DirectContractingRepository
            .FindAsync(dc => dc.DCNumber == request.DCNumber, cancellationToken) != null;
        if (duplicateDcNumber)
        {
            return ApiResponse<Guid>.Fail($"A Direct Contracting request with DC Number '{request.DCNumber}' already exists.");
        }

        Guid? createdByUserId = null;
        if (Guid.TryParse(currentUserService.UserId, out var actorId))
        {
            createdByUserId = actorId;
        }

        // 6. Create Direct Contracting request
        var directContracting = new DirectContracting
        {
            DCNumber = request.DCNumber,
            Name = request.Name,
            BACProjectId = request.BACProjectId,
            ExclusiveSupplierId = request.ExclusiveSupplierId,
            SubmissionDeadline = request.SubmissionDeadline,
            Status = ERPEZ.Domain.Enums.DirectContractingStatusEnum.DRAFT,
            TotalABC = totalAbc,
            CreatedByUserId = createdByUserId
        };

        await unitOfWork.DirectContractingRepository.AddAsync(directContracting, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(directContracting.Id, "Direct Contracting request drafted successfully.");
    }
}
