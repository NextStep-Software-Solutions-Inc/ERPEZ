using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Office.Commands.CreateOffice;

public class CreateOfficeCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateOfficeCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateOfficeCommand request, CancellationToken cancellationToken)
    {
        // Validate required foreign keys
        _ = await unitOfWork.OfficeTypeRepository.GetByIdAsync(request.OfficeTypeId, cancellationToken: cancellationToken) ??
            throw new NotFoundException("OfficeType not found.");
        _ = await unitOfWork.OrganizationRepository.GetByIdAsync(request.OrganizationId, cancellationToken: cancellationToken) ??
            throw new NotFoundException("Organization not found.");
        _ = await unitOfWork.CategoryRepository.GetByIdAsync(request.CategoryId, cancellationToken: cancellationToken) ??
            throw new NotFoundException("Category not found.");
        _ = await unitOfWork.AdministrativeLevelRepository.GetByIdAsync(request.AdministrativeLevelId, cancellationToken: cancellationToken) ??
            throw new NotFoundException("AdministrativeLevel not found.");

        // Validate optional foreign keys
        if (request.ClusterId.HasValue)
        {
            _ = await unitOfWork.ClusterRepository.GetByIdAsync(request.ClusterId.Value, cancellationToken: cancellationToken) ??
                throw new NotFoundException("Cluster not found.");
        }
        if (request.ProcurementWorkflowId.HasValue)
        {
            _ = await unitOfWork.ProcurementWorkflowRepository.GetByIdAsync(request.ProcurementWorkflowId.Value, cancellationToken: cancellationToken) ??
                throw new NotFoundException("ProcurementWorkflow not found.");
        }
        if (request.ParentId.HasValue)
        {
            var parent = await unitOfWork.OfficeRepository.GetByIdAsync(request.ParentId.Value, cancellationToken: cancellationToken) ??
                throw new NotFoundException("Parent Office not found.");

            // Validate parent can have children
            var parentCategory = await unitOfWork.CategoryRepository.GetByIdAsync(parent.CategoryId, cancellationToken);
            if (parentCategory != null && !parentCategory.CanHaveChildren)
                throw new ConflictException($"Parent Office '{parent.Name}' cannot have children based on its category configuration.");
        }

        // Check for duplicate Code
        var officeExist = await unitOfWork.OfficeRepository.FindAsync(t => t.Code == request.Code, cancellationToken: cancellationToken);
        if (officeExist != null) throw new ConflictException("Office with this code already exists.");

        var office = new Domain.Entities.Planning.Office
        {
            Name = request.Name,
            Code = request.Code,
            Address = request.Address,
            Description = request.Description,
            ResponsibilityCenterCode = request.ResponsibilityCenterCode,
            BudgetCostCenter = request.BudgetCostCenter,
            OfficeTypeId = request.OfficeTypeId,
            OrganizationId = request.OrganizationId,
            CategoryId = request.CategoryId,
            AdministrativeLevelId = request.AdministrativeLevelId,
            ClusterId = request.ClusterId,
            ProcurementWorkflowId = request.ProcurementWorkflowId,
            ParentId = request.ParentId
        };

        await unitOfWork.OfficeRepository.AddAsync(office, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(office.Id, "Office created successfully.");
    }
}
