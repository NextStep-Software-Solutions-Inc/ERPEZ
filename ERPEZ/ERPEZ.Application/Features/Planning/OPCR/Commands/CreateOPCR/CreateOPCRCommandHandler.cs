using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCR.Commands.CreateOPCR;

public class CreateOPCRCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateOPCRCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        CreateOPCRCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.OfficeRepository.GetByIdAsync(request.OfficeId, cancellationToken)
            ?? throw new NotFoundException("Office not found.");

        var opcr = new Domain.Entities.Planning.OPCR
        {
            Id           = Guid.NewGuid(), 
            OfficeId     = request.OfficeId,
            FiscalYearId = request.FiscalYearId,
            Name         = request.Name ?? string.Empty,
            Code         = request.Code ?? string.Empty,
            CreatedAt    = DateTime.UtcNow
        };
        await unitOfWork.OPCRRepository.AddAsync(opcr, cancellationToken);

        // Auto-populate OPCRItems from all KPIAssignments for this office + FY.
        // IsShopped will be properly set once the shopping workflow endpoint is implemented.
        var assignments = await unitOfWork.KPIAssignmentRepository.GetListAsync(
            unitOfWork.KPIAssignmentRepository
                .Query(a => a.OfficeId == request.OfficeId
                         && a.FYActiveKPI != null
                         && a.FYActiveKPI.FiscalYearId == request.FiscalYearId)
                .Select(a => new
                {
                    a.Id,
                    a.AssignedTargetQ1,
                    a.AssignedTargetQ2,
                    a.AssignedTargetQ3,
                    a.AssignedTargetQ4
                }),
            cancellationToken);

        var opcrItems = assignments.Select(a => new Domain.Entities.Planning.OPCRItem
        {
            Id              = Guid.NewGuid(),
            OPCRId          = opcr.Id,
            KPIAssignmentId = a.Id,
            IsShopped       = false, // TODO: set correctly once shopping workflow is implemented
            Q1Target        = (int)(a.AssignedTargetQ1 ?? 0),
            Q2Target        = (int)(a.AssignedTargetQ2 ?? 0),
            Q3Target        = (int)(a.AssignedTargetQ3 ?? 0),
            Q4Target        = (int)(a.AssignedTargetQ4 ?? 0),
            CreatedAt       = DateTime.UtcNow
        }).ToList();

        await unitOfWork.OPCRItemRepository.AddRangeAsync(opcrItems, cancellationToken);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(opcr.Id, "OPCR created successfully.");
    }
}