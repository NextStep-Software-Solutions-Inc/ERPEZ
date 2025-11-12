using ERPEZ.Application.Features.Planning.KPI.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.CreateKPI;

public class CreateKPICommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateKPICommand, ApiResponse<KPIResponse>>
{
    public async Task<ApiResponse<KPIResponse>> Handle(CreateKPICommand request, CancellationToken cancellationToken)
    {
        var existingKpi = await unitOfWork.KPIRepository.FindAsync(
            x => x.Name == request.Name && x.FunctionType == request.FunctionType,
            cancellationToken
        );

        if (existingKpi != null)
            throw new ConflictException("KPI with the same name and Function type already exists.");

        if (request.ParentKPIId != null)
        {
            var parentKpi = await unitOfWork.KPIRepository.GetByIdAsync(request.ParentKPIId.Value, cancellationToken: cancellationToken)
                ?? throw new NotFoundException("Parent KPI not found.");
        }

        var kpi = new Domain.Entities.Planning.KPI
        {
            ParentKPIId = request.ParentKPIId,
            FunctionType = request.FunctionType,
            Name = request.Name,
            Description = request.Description,
            IsOfficeMandate = request.IsOfficeMandate,
            IsPercentage = request.IsPercentage,
            Status = "Draft"
        };

        await unitOfWork.KPIRepository.AddAsync(kpi, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new KPIResponse
        {
            Id = kpi.Id,
            ParentKPIId = kpi.ParentKPIId,
            FunctionType = request.FunctionType,
            Name = kpi.Name,
            Description = kpi.Description,
            IsOfficeMandate = kpi.IsOfficeMandate,
            IsPercentage = kpi.IsPercentage,
            Status = kpi.Status,
            CreatedAt = kpi.CreatedAt,
            CreatedBy = kpi.CreatedBy
        };
        return ApiResponse<KPIResponse>.Success(dto, "KPI created successfully.");
    }
}
