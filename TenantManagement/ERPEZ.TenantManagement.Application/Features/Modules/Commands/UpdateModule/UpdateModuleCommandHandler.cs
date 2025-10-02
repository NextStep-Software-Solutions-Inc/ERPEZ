using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Modules.Commands.UpdateModule;

public sealed class UpdateModuleCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateModuleCommand, ApiResponse<Module>>
{
    public async Task<ApiResponse<Module>> Handle(UpdateModuleCommand request, CancellationToken cancellationToken)
    {
        var module = await unitOfWork.ModuleRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken);

        if (module == null)
        {
            return new ApiResponse<Module>
            {
                Succeeded = false,
                Message = "Module not found.",
                Data = null
            };
        }
        if (module.Name == request.UpdateModule?.Name)
        {
            return new ApiResponse<Module>
            {
                Succeeded = false,
                Message = "Module already exist.",
                Data = module
            };
        }

        module.Name = string.IsNullOrWhiteSpace(request.UpdateModule?.Name)
            ? module.Name
            : request.UpdateModule.Name;

        module.Key = string.IsNullOrWhiteSpace(request.UpdateModule?.Key)
            ? module.Key
            : request.UpdateModule.Key;

        module.Description = string.IsNullOrWhiteSpace(request.UpdateModule?.Description)
            ? module.Description
            : request.UpdateModule.Description;

        module.IsActive = request.UpdateModule?.IsActive ?? module.IsActive;


        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new ApiResponse<Module>
        {
            Succeeded = true,
            Message = "Updated Successfully.",
            Data = module
        };
    }
}
