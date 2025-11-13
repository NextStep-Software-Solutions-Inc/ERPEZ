using ERPEZ.Application.Features.Planning.KPI.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.UpdateKPI;

public class UpdateKPICommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateKPICommand, ApiResponse<KPIResponse>>
{
    public async Task<ApiResponse<KPIResponse>> Handle(UpdateKPICommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateKPI;

        var kpi = await unitOfWork.KPIRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI not found.");

        var duplicate = await unitOfWork.KPIRepository.FindAsync(
            x => x.Name == dto.Name &&
            x.FunctionType == dto.FunctionType &&
            request.Id != kpi.Id,
            cancellationToken
        );

        if (duplicate != null)
            throw new ConflictException("KPI with the same name and Function type already exists.");

        kpi.Name = dto.Name ?? kpi.Name;
        kpi.Description = dto.Description ?? kpi.Description;
        kpi.ParentKPIId = dto.ParentKPIId ?? kpi.ParentKPIId;
        kpi.FunctionType = dto.FunctionType ?? kpi.FunctionType;
        kpi.IsOfficeMandate = dto.IsOfficeMandate ?? kpi.IsOfficeMandate;
        kpi.IsPercentage = dto.IsPercentage ?? kpi.IsPercentage;
        kpi.Status = dto.Status ?? kpi.Status;

        unitOfWork.KPIRepository.Update(kpi);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var result = new KPIResponse()
        {
            Id = kpi.Id,
            ParentKPIId = kpi.ParentKPIId,
            FunctionType = kpi.FunctionType,
            Description = kpi.Description,
            Name = kpi.Name,
            IsOfficeMandate = kpi.IsOfficeMandate,
            IsPercentage = kpi.IsPercentage,
            Status = kpi.Status,
            CreatedBy = kpi.CreatedBy,
            CreatedAt = kpi.CreatedAt
        };

        return ApiResponse<KPIResponse>.Success(result, "KPI updated successfully.");
    }
}
