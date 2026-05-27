using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.CreateMarketScoping;

public class CreateMarketScopingCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateMarketScopingCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateMarketScopingCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        _ = await unitOfWork.UserRepository.GetByIdAsync(request.UserId, cancellationToken)
            ?? throw new NotFoundException($"User with ID {request.UserId} not found.");

        _ = await unitOfWork.LineItemBudgetActivityRepository.GetByIdAsync(request.TargetLineItemBudgetActivityId, cancellationToken)
            ?? throw new NotFoundException($"Line Item Budget Activity with ID {request.TargetLineItemBudgetActivityId} not found.");

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
                ActivityId = activityDto.ActivityId,
                CreatedAt = DateTime.UtcNow,
            };

            // Add attachments to activity
            foreach (var attachmentDto in activityDto.Attachments)
            {
                activity.Attachments.Add(new MarketScopingActivityAttachment
                {
                    Id = Guid.NewGuid(),
                    MarketScopingActivityId = activity.Id,
                    FileUrl = attachmentDto.FileUrl,
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
                ParameterId = parameterDto.ParameterId,
                IsConsidered = parameterDto.IsConsidered,
                Remarks = parameterDto.Remarks,
                CreatedAt = DateTime.UtcNow,
            };

            // Add attachments to parameter
            foreach (var attachmentDto in parameterDto.Attachments)
            {
                parameter.Attachments.Add(new MarketScopingParameterAttachment
                {
                    Id = Guid.NewGuid(),
                    MarketScopingParameterId = parameter.Id,
                    FileUrl = attachmentDto.FileUrl,
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
