using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using AppItemEntity = ERPEZ.Domain.Entities.Planning.APPItem;

namespace ERPEZ.Application.Features.Planning.APP.Commands.CloneUpdatedAPP;

public class CloneUpdatedAPPCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CloneUpdatedAPPCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CloneUpdatedAPPCommand request, CancellationToken cancellationToken)
    {
        // 1. Load source APP with details
        var sourceApp = await unitOfWork.APPRepository.GetAPPWithDetailsAsync(request.SourceAppId, cancellationToken)
            ?? throw new NotFoundException("Source APP not found.");

        // 2. Validate source APP eligibility: must be Approved and must be Final or Updated type
        if (!string.Equals(sourceApp.APPType, "Final", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(sourceApp.APPType, "Updated", StringComparison.OrdinalIgnoreCase))
        {
            throw new ValidationException("Only Final or Updated APPs can be used as a source for an Updated APP. Indicative APPs cannot be updated.");
        }

        var isApproved = sourceApp.Status == StatusEnum.Approved ||
                         string.Equals(sourceApp.IsFinal, "true", StringComparison.OrdinalIgnoreCase);

        if (!isApproved)
        {
            throw new ValidationException("Updated APPs can only be created from an approved Final APP or an approved Updated APP.");
        }

        // 3. Obtain next sequential version via Infrastructure repository abstraction
        var nextVersionNumber = await unitOfWork.APPRepository.GetNextVersionNumberAsync(sourceApp.Id, cancellationToken);
        var now = DateTime.UtcNow;

        var appNumber = string.IsNullOrWhiteSpace(request.APPNumber)
            ? $"{sourceApp.APPNumber}-V{nextVersionNumber}"
            : request.APPNumber;

        // Check for duplicate APPNumber
        var hasAppNumber = await unitOfWork.APPRepository.HasAPPNumberAsync(appNumber, cancellationToken);
        if (hasAppNumber)
            throw new ConflictException($"APP with number '{appNumber}' already exists.");

        var appName = string.IsNullOrWhiteSpace(request.Name)
            ? $"{sourceApp.Name} (Updated V{nextVersionNumber})"
            : request.Name;

        // 4. Create new Updated APP entity
        var updatedApp = new ERPEZ.Domain.Entities.Planning.APP
        {
            Id = Guid.NewGuid(),
            APPNumber = appNumber,
            Name = appName,
            FiscalYearId = sourceApp.FiscalYearId,
            APPType = "Updated",
            Batch = string.IsNullOrWhiteSpace(request.Batch) ? sourceApp.Batch : request.Batch,
            Quarter = string.IsNullOrWhiteSpace(request.Quarter) ? sourceApp.Quarter : request.Quarter,
            VersionNumber = nextVersionNumber,
            VersionDate = now,
            SourceAPPId = sourceApp.Id,
            IsFinal = "false",
            Remarks = request.Remarks ?? sourceApp.Remarks,
            Description = request.Description ?? sourceApp.Description,
            Status = StatusEnum.Draft,
        };

        await unitOfWork.APPRepository.AddAsync(updatedApp, cancellationToken);

        // 5. Deep clone APPPPMP junction records
        foreach (var link in sourceApp.APPPPMPs.Where(l => !l.IsDeleted))
        {
            var newLink = new APPPPMP
            {
                Id = Guid.NewGuid(),
                APPId = updatedApp.Id,
                PPMPId = link.PPMPId
            };
            await unitOfWork.APPPPMPRepository.AddAsync(newLink, cancellationToken);
        }

        // 6. Deep clone APPItem records
        foreach (var item in sourceApp.APPItems.Where(i => !i.IsDeleted))
        {
            var newItem = new AppItemEntity
            {
                Id = Guid.NewGuid(),
                APPId = updatedApp.Id,
                PPMPItemId = item.PPMPItemId,
                ProcurementModeId = item.ProcurementModeId,
                FundSourceId = item.FundSourceId,
                OfficeId = item.OfficeId,
                PAPCode = item.PAPCode,
                Remarks = item.Remarks,
                IsEarlyProcurementActivity = item.IsEarlyProcurementActivity,
                IsOutsourced = item.IsOutsourced,
                BidEvaluationCriteria = item.BidEvaluationCriteria,
                ProcurementStrategies = item.ProcurementStrategies != null ? new List<ProcurementStrategy>(item.ProcurementStrategies) : null,
                StartOfProcurementOverride = item.StartOfProcurementOverride,
                EndOfProcurementOverride = item.EndOfProcurementOverride,
                IsNew = false,
                IsRevised = false
            };
            await unitOfWork.APPItemRepository.AddAsync(newItem, cancellationToken);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(updatedApp.Id, $"Updated APP Version {nextVersionNumber} created successfully.");
    }
}
