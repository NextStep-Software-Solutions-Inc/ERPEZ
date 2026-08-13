using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APP.Commands.CreateAPP;

public class CreateAPPCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateAPPCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateAPPCommand request, CancellationToken cancellationToken)
    {
        // Validate FiscalYear exists
        _ = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId, cancellationToken)
            ?? throw new NotFoundException("Fiscal year not found.");

        // Updated APPs must originate via the CloneUpdatedAPP workflow from an approved source APP.
        if (string.Equals(request.APPType, "Updated", StringComparison.OrdinalIgnoreCase))
            throw new ValidationException(
                "Updated APPs cannot be created directly without a source APP. " +
                "Use the Create Updated APP workflow from an approved Final or Updated APP.");

        // Check for duplicate APPNumber
        var hasAppNumber = await unitOfWork.APPRepository.HasAPPNumberAsync(request.APPNumber, cancellationToken);
        if (hasAppNumber)
            throw new ConflictException($"APP with number '{request.APPNumber}' already exists.");

        // IsFinal is a derived/legacy compatibility field:
        //   - Indicative APPs → always "false"
        //   - Final APPs start as Draft → "false"; become "true" only when Status transitions to Approved
        //     (handled by ChangeAPPStatusCommandHandler)
        //   - Updated APPs → always "false" (set by CloneUpdatedAPPCommandHandler)
        var isFinal = "false";

        var entity = new ERPEZ.Domain.Entities.Planning.APP
        {
            Id           = Guid.NewGuid(),
            APPNumber    = request.APPNumber,
            Name         = request.Name,
            FiscalYearId = request.FiscalYearId,
            APPType      = string.IsNullOrWhiteSpace(request.APPType) ? "Indicative" : request.APPType,
            Batch        = string.IsNullOrWhiteSpace(request.Batch)   ? "Batch 1"    : request.Batch,
            Quarter      = string.IsNullOrWhiteSpace(request.Quarter) ? "Q1"         : request.Quarter,
            IsFinal      = isFinal,
            Remarks      = request.Remarks,
            Description  = request.Description,
            Status       = StatusEnum.Draft,
        };

        await unitOfWork.APPRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "APP created successfully.");
    }
}
