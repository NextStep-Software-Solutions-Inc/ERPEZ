using ERPEZ.Application.Interfaces;
using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.CreateMarketScoping;

public class CreateMarketScopingCommandHandler(
    IUnitOfWork unitOfWork,
    IFileStorageService fileStorageService)
    : IRequestHandler<CreateMarketScopingCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateMarketScopingCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        _ = await unitOfWork.UserRepository.GetByIdAsync(request.UserId, cancellationToken)
            ?? throw new NotFoundException($"User with ID {request.UserId} not found.");

        if (request.TargetLineItemBudgetActivityId.HasValue)
        {
            _ = await unitOfWork.LineItemBudgetActivityRepository.GetByIdAsync(request.TargetLineItemBudgetActivityId.Value, cancellationToken)
                ?? throw new NotFoundException($"Line Item Budget Activity with ID {request.TargetLineItemBudgetActivityId.Value} not found.");
        }

        var marketScoping = new Domain.Entities.Planning.MarketScoping
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            ProjectName = request.ProjectName,
            EstimatedBudget = request.EstimatedBudget,
            PeriodFrom = request.PeriodFrom,
            PeriodTo = request.PeriodTo,
            DeliveryDate = request.DeliveryDate,
            TargetLineItemBudgetActivityId = request.TargetLineItemBudgetActivityId,
            CreatedAt = DateTime.UtcNow,
        };

        // Add activities conducted
        foreach (var activityDto in request.ActivitiesConducted)
        {
            var activity = new ERPEZ.Domain.Entities.Planning.MarketScopingActivity
            {
                Id = Guid.NewGuid(),
                MarketScopingId = marketScoping.Id,
                ActivitySettingsId = activityDto.ActivitySettingsId,
                ActivityId = activityDto.ActivityId,
                CreatedAt = DateTime.UtcNow,
            };

            // Add attachments to activity and promote files from temp storage
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

        // Add parameter evaluations
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

            // Add attachments to parameter and promote files from temp storage
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

        await unitOfWork.MarketScopingRepository.AddAsync(marketScoping, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new ApiResponse<Guid>
        {
            Succeeded = true,
            Data = marketScoping.Id,
            Message = "Market scoping created successfully."
        };
    }
}
