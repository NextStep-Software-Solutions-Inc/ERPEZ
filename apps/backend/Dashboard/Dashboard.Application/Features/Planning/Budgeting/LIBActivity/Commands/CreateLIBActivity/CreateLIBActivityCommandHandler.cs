using ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Rules;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Commands.CreateLIBActivity;

public class CreateLIBActivityCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateLIBActivityCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateLIBActivityCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        var lib = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(request.LineItemBudgetId, cancellationToken)
            ?? throw new NotFoundException($"LIB with ID {request.LineItemBudgetId} not found.");

        if (!LIBRules.IsEditable(lib.Status))
            throw new ValidationException("Activities can only be added to a Draft, Proposed, or Returned LIB.");

        if (request.WFPObjectiveActivityId.HasValue && request.OPCRActivityId.HasValue)
        {
            throw new ERPEZ.Shared.Exceptions.ValidationException("Only one source activity reference is allowed (either WFPObjectiveActivityId or OPCRActivityId).");
        }

        Domain.Entities.Planning.WFPObjectiveActivity? wfpActivity = null;
        Domain.Entities.Planning.OPCRActivity? opcrActivity = null;

        if (lib.SourceType.Equals("WFP", StringComparison.OrdinalIgnoreCase))
        {
            if (!request.WFPObjectiveActivityId.HasValue)
                throw new ERPEZ.Shared.Exceptions.ValidationException("WFPObjectiveActivityId is required for WFP-sourced LIB.");

            var existingWfp = await unitOfWork.LineItemBudgetActivityRepository.FindAsync(
                x => x.LineItemBudgetId == request.LineItemBudgetId &&
                     x.WFPObjectiveActivityId == request.WFPObjectiveActivityId.Value &&
                     !x.IsDeleted,
                cancellationToken);

            if (existingWfp != null)
                throw new ERPEZ.Shared.Exceptions.ValidationException("This WFP Activity is already linked to this Line Item Budget.");

            wfpActivity = await unitOfWork.WFPObjectiveActivityRepository.GetByIdAsync(request.WFPObjectiveActivityId.Value, cancellationToken)
                ?? throw new NotFoundException($"WFP Objective Activity with ID {request.WFPObjectiveActivityId} not found.");
        }
        else if (lib.SourceType.Equals("OPCR", StringComparison.OrdinalIgnoreCase))
        {
            if (!request.OPCRActivityId.HasValue)
                throw new ERPEZ.Shared.Exceptions.ValidationException("OPCRActivityId is required for OPCR-sourced LIB.");

            var existingOpcr = await unitOfWork.LineItemBudgetActivityRepository.FindAsync(
                x => x.LineItemBudgetId == request.LineItemBudgetId &&
                     x.OPCRActivityId == request.OPCRActivityId.Value &&
                     !x.IsDeleted,
                cancellationToken);

            if (existingOpcr != null)
                throw new ERPEZ.Shared.Exceptions.ValidationException("This OPCR Activity is already linked to this Line Item Budget.");

            opcrActivity = await unitOfWork.OPCRActivityRepository.GetByIdAsync(request.OPCRActivityId.Value, cancellationToken)
                ?? throw new NotFoundException($"OPCR Activity with ID {request.OPCRActivityId} not found.");
        }

        string papCode = request.PAPCode ?? string.Empty;
        if (string.IsNullOrWhiteSpace(papCode))
        {
            var fiscalYear = lib.FiscalYearEntity
                ?? (lib.FiscalYearId.HasValue ? await unitOfWork.FiscalYearRepository.GetByIdAsync(lib.FiscalYearId.Value, cancellationToken) : null);
            var yearStr = fiscalYear?.Year.ToString() ?? DateTime.UtcNow.Year.ToString();

            var office = lib.Office
                ?? (lib.OfficeId.HasValue ? await unitOfWork.OfficeRepository.GetByIdAsync(lib.OfficeId.Value, cancellationToken) : null);
            var officeCode = !string.IsNullOrWhiteSpace(office?.Code) ? office.Code : "00";

            var existingActivities = await unitOfWork.LineItemBudgetActivityRepository.FindAllAsync(
                x => x.LineItemBudgetId == request.LineItemBudgetId && !x.IsDeleted,
                cancellationToken);

            papCode = $"{yearStr}-{officeCode}-{(existingActivities.Count + 1):D5}";
        }

        var entity = new Domain.Entities.Planning.LineItemBudgetActivity
        {
            LineItemBudgetId = request.LineItemBudgetId,
            WFPObjectiveActivityId = request.WFPObjectiveActivityId,
            OPCRActivityId = request.OPCRActivityId,
            PAPCode = papCode,
            Name = wfpActivity?.ActivityName
                ?? opcrActivity?.Name
                ?? request.Name
                ?? throw new ERPEZ.Shared.Exceptions.ValidationException("Name is required for independent activities.")
        };

        await unitOfWork.LineItemBudgetActivityRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "LIB Activity created successfully.");
    }
}

