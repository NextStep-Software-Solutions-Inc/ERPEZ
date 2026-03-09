using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Commands.CreateWorkflowMatrix;

public class CreateWorkflowMatrixCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateWorkflowMatrixCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateWorkflowMatrixCommand request, CancellationToken cancellationToken)
    {
        var fiscalYear = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId, cancellationToken);
        if (fiscalYear == null)
            throw new NotFoundException("Fiscal Year not found.");

        var office = await unitOfWork.OfficeRepository.GetByIdAsync(request.OfficeId, cancellationToken);
        if (office == null)
            throw new NotFoundException("Office not found.");

        // Validate Positions exist
        var recommendingPosition = await unitOfWork.PositionRepository.GetByIdAsync(request.RecommendingApproverPositionId, cancellationToken);
        if (recommendingPosition == null)
            throw new NotFoundException("Recommending Approver Position not found.");

        var finalPosition = await unitOfWork.PositionRepository.GetByIdAsync(request.FinalApproverPositionId, cancellationToken);
        if (finalPosition == null)
            throw new NotFoundException("Final Approver Position not found.");

        var existingMatrix = await unitOfWork.WorkflowMatrixRepository.FindAsync(
            x => x.FiscalYearId == request.FiscalYearId && 
                 x.OfficeId == request.OfficeId && 
                 x.DocumentType == request.DocumentType,
            cancellationToken);

        if (existingMatrix != null)
            throw new ConflictException("Workflow Matrix already exists for this Fiscal Year, Office, and Document Type combination.");

        var entity = new Domain.Entities.Planning.WorkflowMatrix
        {
            Id = Guid.NewGuid(),
            OfficeId = request.OfficeId,
            FiscalYearId = request.FiscalYearId,
            RecommendingApproverPositionId = request.RecommendingApproverPositionId,
            FinalApproverPositionId = request.FinalApproverPositionId,
            DocumentType = request.DocumentType,
            Status = "Active"
        };

        await unitOfWork.WorkflowMatrixRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id);
    }
}
