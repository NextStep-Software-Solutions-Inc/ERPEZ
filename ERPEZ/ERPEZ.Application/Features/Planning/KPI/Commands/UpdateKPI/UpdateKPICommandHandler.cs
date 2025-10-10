using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.UpdateKPI;

public class UpdateKPICommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateKPICommand, ApiResponse<Domain.Entities.Planning.KPI>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.KPI>> Handle(UpdateKPICommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateKPI;

        var kpi = await _unitOfWork.KPIRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI not found.");

        if (dto.FunctionPercentageAllocationId != null)
        {
            var fpa = await _unitOfWork.FunctionPercentageAllocationRepository.GetByIdAsync(dto.FunctionPercentageAllocationId ?? Guid.Empty, cancellationToken: cancellationToken)
                ?? throw new NotFoundException("Function Percentage Allocation not found.");
        }

        var duplicate = await _unitOfWork.KPIRepository.FindAsync(
            x => x.Name == dto.Name && x.FunctionPercentageAllocationId == dto.FunctionPercentageAllocationId,
            cancellationToken
        );

        if (duplicate != null)
            throw new ConflictException("KPI with the same name and Function Percentage Allocation already exists.");

        kpi.Name = dto.Name ?? kpi.Name;
        kpi.Description = dto.Description ?? kpi.Description;
        kpi.ParentKPIId = dto.ParentKPIId ?? kpi.ParentKPIId;
        kpi.FunctionPercentageAllocationId = dto.FunctionPercentageAllocationId ?? kpi.FunctionPercentageAllocationId;
        kpi.IsOfficeMandate = dto.IsOfficeMandate ?? kpi.IsOfficeMandate;
        kpi.Status = dto.Status ?? kpi.Status;

        _unitOfWork.KPIRepository.Update(kpi);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.KPI>.Success(kpi, "KPI updated successfully.");
    }
}
