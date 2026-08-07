using ERPEZ.Application.Interfaces;
using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.UpdateMarketScoping;

public class UpdateMarketScopingCommandHandler(
    IUnitOfWork unitOfWork,
    IFileStorageService fileStorageService)
    : IRequestHandler<UpdateMarketScopingCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateMarketScopingCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        var marketScoping = await unitOfWork.MarketScopingRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"Market scoping with ID {request.Id} not found.");

        if (request.TargetLineItemBudgetActivityId.HasValue)
        {
            _ = await unitOfWork.LineItemBudgetActivityRepository.GetByIdAsync(request.TargetLineItemBudgetActivityId.Value, cancellationToken)
                ?? throw new NotFoundException($"Line Item Budget Activity with ID {request.TargetLineItemBudgetActivityId.Value} not found.");
        }

        marketScoping.ProjectName = request.ProjectName;
        marketScoping.EstimatedBudget = request.EstimatedBudget;
        marketScoping.PeriodFrom = request.PeriodFrom;
        marketScoping.PeriodTo = request.PeriodTo;
        marketScoping.DeliveryDate = request.DeliveryDate;
        marketScoping.TargetLineItemBudgetActivityId = request.TargetLineItemBudgetActivityId;
        marketScoping.UpdatedAt = DateTime.UtcNow;

        // Clear and rebuild activities
        marketScoping.ActivitiesConducted.Clear();
        foreach (var activityDto in request.ActivitiesConducted)
        {
            var activity = new ERPEZ.Domain.Entities.Planning.MarketScopingActivity
            {
                Id = Guid.NewGuid(),
                MarketScopingId = marketScoping.Id,
                ActivityId = activityDto.ActivityId,
                ActivitySettingsId = activityDto.ActivitySettingsId,
                CreatedAt = DateTime.UtcNow,
            };

            foreach (var attachmentDto in activityDto.Attachments)
            {
                var fileUrl = attachmentDto.FileUrl;
                if (Guid.TryParse(attachmentDto.FileUrl, out var fileId))
                {
                    try
                    {
                        await fileStorageService.PromoteFileAsync(fileId);
                    }
                    catch
                    {
                        // Ignore if file doesn't exist in temp storage or is already promoted
                    }
                    fileUrl = $"/files/download/{fileId}";
                }

                activity.Attachments.Add(new MarketScopingActivityAttachment
                {
                    Id = Guid.NewGuid(),
                    MarketScopingActivityId = activity.Id,
                    FileUrl = fileUrl,
                    FileName = attachmentDto.FileName,
                    CreatedAt = DateTime.UtcNow,
                });
            }

            marketScoping.ActivitiesConducted.Add(activity);
        }

        // Clear and rebuild parameters
        marketScoping.ParameterEvaluations.Clear();
        foreach (var parameterDto in request.ParameterEvaluations)
        {
            var parameter = new ERPEZ.Domain.Entities.Planning.MarketScopingParameter
            {
                Id = Guid.NewGuid(),
                MarketScopingId = marketScoping.Id,
                ParameterSettingsId = parameterDto.ParameterSettingsId,
                ParameterId = parameterDto.ParameterId,
                IsConsidered = parameterDto.IsConsidered,
                Remarks = parameterDto.Remarks,
                CreatedAt = DateTime.UtcNow,
            };

            foreach (var attachmentDto in parameterDto.Attachments)
            {
                var fileUrl = attachmentDto.FileUrl;
                if (Guid.TryParse(attachmentDto.FileUrl, out var fileId))
                {
                    try
                    {
                        await fileStorageService.PromoteFileAsync(fileId);
                    }
                    catch
                    {
                        // Ignore if file doesn't exist in temp storage or is already promoted
                    }
                    fileUrl = $"/files/download/{fileId}";
                }

                parameter.Attachments.Add(new MarketScopingParameterAttachment
                {
                    Id = Guid.NewGuid(),
                    MarketScopingParameterId = parameter.Id,
                    FileUrl = fileUrl,
                    FileName = attachmentDto.FileName,
                    CreatedAt = DateTime.UtcNow,
                });
            }

            marketScoping.ParameterEvaluations.Add(parameter);
        }

        unitOfWork.MarketScopingRepository.Update(marketScoping);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new ApiResponse<Unit>
        {
            Succeeded = true,
            Data = Unit.Value,
            Message = "Market scoping updated successfully."
        };
    }
}
