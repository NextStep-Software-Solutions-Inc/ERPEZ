using ERPEZ.Application.Interfaces;
using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using DomainMarketScopingActivity = ERPEZ.Domain.Entities.Planning.MarketScopingActivity;
using DomainMarketScopingParameter = ERPEZ.Domain.Entities.Planning.MarketScopingParameter;

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

        // 1. Clean up existing child activities and parameters
        var existingActivities = await unitOfWork.MarketScopingActivityRepository
            .FindAllAsync(a => a.MarketScopingId == marketScoping.Id, cancellationToken);
        if (existingActivities.Count > 0)
        {
            foreach (var a in existingActivities)
            {
                a.AllowHardDelete = true;
            }
            unitOfWork.MarketScopingActivityRepository.RemoveRange(existingActivities);
        }

        var existingParameters = await unitOfWork.MarketScopingParameterRepository
            .FindAllAsync(p => p.MarketScopingId == marketScoping.Id, cancellationToken);
        if (existingParameters.Count > 0)
        {
            foreach (var p in existingParameters)
            {
                p.AllowHardDelete = true;
            }
            unitOfWork.MarketScopingParameterRepository.RemoveRange(existingParameters);
        }

        // 2. Rebuild and add new activities conducted
        var newActivities = new List<DomainMarketScopingActivity>();
        foreach (var activityDto in request.ActivitiesConducted)
        {
            var activity = new DomainMarketScopingActivity
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

            newActivities.Add(activity);
        }

        if (newActivities.Count > 0)
        {
            await unitOfWork.MarketScopingActivityRepository.AddRangeAsync(newActivities, cancellationToken);
        }

        // 3. Rebuild and add new parameter evaluations
        var newParameters = new List<DomainMarketScopingParameter>();
        foreach (var parameterDto in request.ParameterEvaluations)
        {
            var parameter = new DomainMarketScopingParameter
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

            newParameters.Add(parameter);
        }

        if (newParameters.Count > 0)
        {
            await unitOfWork.MarketScopingParameterRepository.AddRangeAsync(newParameters, cancellationToken);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new ApiResponse<Unit>
        {
            Succeeded = true,
            Data = Unit.Value,
            Message = "Market scoping updated successfully."
        };
    }
}
