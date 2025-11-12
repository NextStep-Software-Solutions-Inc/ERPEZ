using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Modules.Commands.UpdateModule;

public sealed class UpdateModuleCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateModuleCommand, ApiResponse<Module>>
{
    public async Task<ApiResponse<Module>> Handle(UpdateModuleCommand request, CancellationToken cancellationToken)
    {
        var module = await unitOfWork.ModuleRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Module not found.");
        if (module.Name == request.UpdateModule?.Name) throw new ConflictException("Module already exist.");
       
        var dto = request.UpdateModule;
        module.Name = dto?.Name ?? module.Name;
        module.Key = dto?.Key ?? module.Key;
        module.Description = dto?.Description ?? module.Description;
        module.IsActive = dto?.IsActive ?? module.IsActive;


        unitOfWork.ModuleRepository.Update(module);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Module>.Success(module, "Module updated successfully.");
    }
}
