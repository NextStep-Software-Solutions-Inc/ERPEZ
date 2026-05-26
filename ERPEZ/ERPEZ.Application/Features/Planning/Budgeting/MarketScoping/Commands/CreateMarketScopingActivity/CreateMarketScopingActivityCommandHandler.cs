using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.CreateMarketScopingActivity;

public class CreateMarketScopingActivityCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateMarketScopingActivityCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateMarketScopingActivityCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        var marketScoping = await unitOfWork.MarketScopingRepository.GetByIdAsync(request.MarketScopingId, cancellationToken)
            ?? throw new NotFoundException($"Market Scoping with ID {request.MarketScopingId} not found.");

        var activity = new MarketScopingActivity
        {
            Id = Guid.NewGuid(),
            MarketScopingId = request.MarketScopingId,
            ActivityId = request.ActivityId,
            CreatedAt = DateTime.UtcNow,
        };

        // Add attachments to activity
        foreach (var attachmentDto in request.Attachments)
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
        unitOfWork.MarketScopingRepository.Update(marketScoping);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new ApiResponse<Guid>
        {
            Succeeded = true,
            Data = activity.Id,
            Message = "Market scoping activity created successfully."
        };
    }
}
