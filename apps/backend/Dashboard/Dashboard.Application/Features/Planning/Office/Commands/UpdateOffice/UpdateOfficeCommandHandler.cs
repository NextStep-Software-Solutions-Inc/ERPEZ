using ERPEZ.Application.Features.Planning.Office.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Office.Commands.UpdateOffice;

public class UpdateOfficeCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateOfficeCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateOfficeCommand request, CancellationToken cancellationToken)
    {
        var office = await unitOfWork.OfficeRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) 
            ?? throw new NotFoundException("Office not found.");
        
        var dto = request.UpdateOffice;

        // Validate Code uniqueness if changed
        if (dto?.Code != null && dto.Code != office.Code)
        {
            var duplicate = await unitOfWork.OfficeRepository.FindAsync(
                x => x.Code == dto.Code,
                cancellationToken
            );
            if (duplicate != null && duplicate.Id != request.Id)
                throw new ConflictException("Office with this code already exists.");
        }

        // Validate required foreign keys if provided
        if (dto?.OfficeTypeId.HasValue == true)
        {
            _ = await unitOfWork.OfficeTypeRepository.GetByIdAsync(dto.OfficeTypeId.Value, cancellationToken: cancellationToken) ??
                throw new NotFoundException("OfficeType not found.");
        }
        if (dto?.OrganizationId.HasValue == true)
        {
            _ = await unitOfWork.OrganizationRepository.GetByIdAsync(dto.OrganizationId.Value, cancellationToken: cancellationToken) ??
                throw new NotFoundException("Organization not found.");
        }
        if (dto?.CategoryId.HasValue == true)
        {
            _ = await unitOfWork.CategoryRepository.GetByIdAsync(dto.CategoryId.Value, cancellationToken: cancellationToken) ??
                throw new NotFoundException("Category not found.");
        }
        if (dto?.AdministrativeLevelId.HasValue == true)
        {
            _ = await unitOfWork.AdministrativeLevelRepository.GetByIdAsync(dto.AdministrativeLevelId.Value, cancellationToken: cancellationToken) ??
                throw new NotFoundException("AdministrativeLevel not found.");
        }

        // Validate optional foreign keys
        if (dto?.ClusterId.HasValue == true)
        {
            _ = await unitOfWork.ClusterRepository.GetByIdAsync(dto.ClusterId.Value, cancellationToken: cancellationToken) ??
                throw new NotFoundException("Cluster not found.");
        }
        if (dto?.ProcurementWorkflowId.HasValue == true)
        {
            _ = await unitOfWork.ProcurementWorkflowRepository.GetByIdAsync(dto.ProcurementWorkflowId.Value, cancellationToken: cancellationToken) ??
                throw new NotFoundException("ProcurementWorkflow not found.");
        }
        if (dto?.ParentId.HasValue == true)
        {
            // Prevent self-reference
            if (dto.ParentId.Value == request.Id)
                throw new ConflictException("Office cannot be its own parent.");

            var parent = await unitOfWork.OfficeRepository.GetByIdAsync(dto.ParentId.Value, cancellationToken: cancellationToken) ??
                throw new NotFoundException("Parent Office not found.");

            // Validate parent can have children
            var parentCategory = await unitOfWork.CategoryRepository.GetByIdAsync(parent.CategoryId, cancellationToken);
            if (parentCategory != null && !parentCategory.CanHaveChildren)
                throw new ConflictException($"Parent Office '{parent.Name}' cannot have children based on its category configuration.");

            // Check for circular reference (prevent descendant from becoming ancestor)
            await ValidateNoCircularReferenceAsync(request.Id, dto.ParentId.Value, cancellationToken);
        }

        // Update properties
        office.Name = dto?.Name ?? office.Name;
        office.Code = dto?.Code ?? office.Code;
        office.Address = dto?.Address ?? office.Address;
        office.Description = dto?.Description ?? office.Description;
        office.ResponsibilityCenterCode = dto?.ResponsibilityCenterCode ?? office.ResponsibilityCenterCode;
        office.BudgetCostCenter = dto?.BudgetCostCenter ?? office.BudgetCostCenter;
        
        if (dto?.OfficeTypeId.HasValue == true) office.OfficeTypeId = dto.OfficeTypeId.Value;
        if (dto?.OrganizationId.HasValue == true) office.OrganizationId = dto.OrganizationId.Value;
        if (dto?.CategoryId.HasValue == true) office.CategoryId = dto.CategoryId.Value;
        if (dto?.AdministrativeLevelId.HasValue == true) office.AdministrativeLevelId = dto.AdministrativeLevelId.Value;
        if (dto?.ClusterId != null) office.ClusterId = dto.ClusterId;
        if (dto?.ProcurementWorkflowId != null) office.ProcurementWorkflowId = dto.ProcurementWorkflowId;
        if (dto?.ParentId != null) office.ParentId = dto.ParentId;

        unitOfWork.OfficeRepository.Update(office);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Office updated successfully.");
    }

    private async Task ValidateNoCircularReferenceAsync(Guid officeId, Guid newParentId, CancellationToken cancellationToken)
    {
        var currentParentId = newParentId;
        var visitedIds = new HashSet<Guid> { officeId };

        while (currentParentId != Guid.Empty)
        {
            if (visitedIds.Contains(currentParentId))
                throw new ConflictException("Circular reference detected in office hierarchy. An office cannot be moved under one of its descendants.");

            visitedIds.Add(currentParentId);

            var parentOffice = await unitOfWork.OfficeRepository.GetByIdAsync(currentParentId, cancellationToken);
            if (parentOffice == null || !parentOffice.ParentId.HasValue)
                break;

            currentParentId = parentOffice.ParentId.Value;
        }
    }
}
