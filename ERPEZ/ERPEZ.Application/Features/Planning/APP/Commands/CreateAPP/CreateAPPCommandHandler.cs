using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using AppEntity = ERPEZ.Domain.Entities.Planning.APP;

namespace ERPEZ.Application.Features.Planning.APP.Commands.CreateAPP;

public class CreateAPPCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateAPPCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateAPPCommand request, CancellationToken cancellationToken)
    {
        // Validate FiscalYear exists
        var fiscalYear = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId, cancellationToken)
            ?? throw new NotFoundException("Fiscal year not found.");

        // Validate Office exists
        var office = await unitOfWork.OfficeRepository.GetByIdAsync(request.OfficeId, cancellationToken)
            ?? throw new NotFoundException("Office not found.");

        // Check for duplicate APPNumber
        var hasAppNumber = await unitOfWork.APPRepository.HasAPPNumberAsync(request.APPNumber, cancellationToken);
        if (hasAppNumber)
            throw new ConflictException($"APP with number '{request.APPNumber}' already exists.");

        // Create new APP entity
        var entity = new AppEntity
        {
            Id = Guid.NewGuid(),
            APPNumber = request.APPNumber,
            Name = request.Name,
            FiscalYearId = request.FiscalYearId,
            OfficeId = request.OfficeId,
            IsFinal = request.IsFinal,
            Remarks = request.Remarks,
            Description = request.Description,
            Status = StatusEnum.Draft,
        };

        // Add to repository and save
        await unitOfWork.APPRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "APP created successfully.");
    }
}
