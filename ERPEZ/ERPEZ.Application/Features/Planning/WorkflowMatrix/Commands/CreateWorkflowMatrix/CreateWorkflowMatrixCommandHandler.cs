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

        var organization = await unitOfWork.OrganizationRepository.GetByIdAsync(request.OrganizationId, cancellationToken);
        if (organization == null)
            throw new NotFoundException("Organization not found.");

        var existingMatrix = await unitOfWork.WorkflowMatrixRepository.FindAsync(
            x => x.FiscalYearId == request.FiscalYearId && 
                 x.OrganizationId == request.OrganizationId && 
                 x.DocumentType == request.DocumentType,
            cancellationToken);

        if (existingMatrix != null)
            throw new ConflictException("Workflow Matrix already exists for this Fiscal Year, Organization, and Document Type combination.");

        var entity = new Domain.Entities.Planning.WorkflowMatrix
        {
            Id = Guid.NewGuid(),
            FiscalYearId = request.FiscalYearId,
            OrganizationId = request.OrganizationId,
            DocumentType = request.DocumentType
        };

        await unitOfWork.WorkflowMatrixRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id);
    }
}
