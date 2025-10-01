using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Application.Features.Tenants.Commands.CreateTenant;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Modules.Commands.CreateModule;

public class CreateModuleCommandHandler : IRequestHandler<CreateModuleCommand, ApiResponse<Module>>
{
    private readonly IModuleRepository _moduleRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateModuleCommandHandler(IModuleRepository moduleRepository, IUnitOfWork unitOfWork)
    {
        _moduleRepository = moduleRepository;
        _unitOfWork = unitOfWork;
    }
    public async Task<ApiResponse<Module>> Handle(CreateModuleCommand request, CancellationToken cancellationToken)
    {
        var moduleExist = await _unitOfWork.ModuleRepository.FindAsync(t => t.Name == request.Name && !t.IsDeleted);
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

        await _moduleRepository.AddAsync(module, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return new()
        {
            Data = module,
            Succeeded = true,
            Message = "Module created successfully."
        };
    }

}
