using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Modules.Commands.CreateModule;

public class CreateModuleCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<CreateModuleCommand, ApiResponse<Module>>
{

    public async Task<ApiResponse<Module>> Handle(CreateModuleCommand request, CancellationToken cancellationToken)
    {
        var moduleExist = await _unitOfWork.ModuleRepository.FindAsync(t => t.Name == request.Name);
        if (moduleExist != null)
        {
            return new()
            {
                Succeeded = false,
                Data = null,
                Message = "Module already exist."
            };
        }
        var module = new Module
        {
            Name = request.Name,
            Key = request.Key,
            Description = request.Description,
            IsActive = request.IsActive

        };

        await _unitOfWork.ModuleRepository.AddAsync(module, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return new()
        {
            Data = module,
            Succeeded = true,
            Message = "Module created successfully."
        };
    }

}
