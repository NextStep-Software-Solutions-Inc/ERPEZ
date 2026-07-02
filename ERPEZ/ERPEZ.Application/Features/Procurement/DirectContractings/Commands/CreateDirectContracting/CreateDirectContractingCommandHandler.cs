using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.CreateDirectContracting;

public class CreateDirectContractingCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateDirectContractingCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateDirectContractingCommand request, CancellationToken cancellationToken)
    {
        // 1. Validate BAC Resolution exists
        var bacResolution = await unitOfWork.BACResolutionRepository.Query()
            .Include(r => r.ProcurementProject)
            .FirstOrDefaultAsync(r => r.Id == request.BACResolutionId && !r.IsDeleted, cancellationToken);

        if (bacResolution == null)
        {
            return ApiResponse<Guid>.Fail("BAC Resolution not found.");
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

        // 3. Single Supplier Rule validation: Ensure no other Direct Contracting is linked to this BAC Resolution
        var existingDC = await unitOfWork.DirectContractingRepository.Query()
            .FirstOrDefaultAsync(dc => dc.BACResolutionId == request.BACResolutionId && !dc.IsDeleted, cancellationToken);

        if (existingDC != null)
        {
            return ApiResponse<Guid>.Fail($"A Direct Contracting request ({existingDC.DCNumber}) has already been linked to this BAC Resolution.");
        }

        // 4. Calculate Total ABC derived from the project (linked via CPR, represented by the ProcurementProject ABC here)
        decimal totalAbc = bacResolution.ProcurementProject?.ABC ?? 0;

        // 5. Generate DC Number
        string dcNumber = $"DC-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(1000, 9999)}";

        // 6. Create Direct Contracting request
        var directContracting = new DirectContracting
        {
            DCNumber = dcNumber,
            Name = request.Name,
            BACResolutionId = request.BACResolutionId,
            ExclusiveSupplierId = request.ExclusiveSupplierId,
            SubmissionDeadline = request.SubmissionDeadline,
            Status = nameof(ERPEZ.Domain.Enums.DirectContractingStatusEnum.DRAFT),
            TotalABC = totalAbc
        };

        await unitOfWork.DirectContractingRepository.AddAsync(directContracting, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(directContracting.Id, "Direct Contracting request drafted successfully.");
    }
}
