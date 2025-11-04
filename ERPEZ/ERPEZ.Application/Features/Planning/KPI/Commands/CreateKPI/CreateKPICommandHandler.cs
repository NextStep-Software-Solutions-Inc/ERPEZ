using ERPEZ.Application.Features.Planning.KPI.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.CreateKPI;

public class CreateKPICommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<CreateKPICommand, ApiResponse<KPIDto>>
{
    public async Task<ApiResponse<KPIDto>> Handle(CreateKPICommand request, CancellationToken cancellationToken)
    {
        var existingKpi = await _unitOfWork.KPIRepository.FindAsync(
            x => x.Name == request.Name,
            cancellationToken
        );

        if (existingKpi != null)
            throw new ConflictException("KPI with the same name and Function Percentage Allocation already exists.");

        if (request.ParentKPIId != null)
        {
            var parentKpi = await _unitOfWork.KPIRepository.GetByIdAsync(request.ParentKPIId.Value, cancellationToken: cancellationToken)
                ?? throw new NotFoundException("Parent KPI not found.");
        }

        var kpi = new Domain.Entities.Planning.KPI
        {
            ParentKPIId = request.ParentKPIId,
            FunctionType = request.FunctionType,
            Name = request.Name,
            Description = request.Description,
            IsOfficeMandate = request.IsOfficeMandate,
            Status = request.Status
        };

        await _unitOfWork.KPIRepository.AddAsync(kpi, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new KPIDto
        {
            Id = kpi.Id,
            ParentKPIId = kpi.ParentKPIId,
            FunctionType = request.FunctionType,
            Name = kpi.Name,
            Description = kpi.Description,
            IsOfficeMandate = kpi.IsOfficeMandate,
            Status = kpi.Status
        };
        return ApiResponse<KPIDto>.Success(dto, "KPI created successfully.");
    }
}
