using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.CreateMarketScopingParameter;

public class CreateMarketScopingParameterCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateMarketScopingParameterCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateMarketScopingParameterCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        var marketScoping = await unitOfWork.MarketScopingRepository.GetByIdAsync(request.MarketScopingId, cancellationToken)
            ?? throw new NotFoundException($"Market Scoping with ID {request.MarketScopingId} not found.");

        var parameter = new ERPEZ.Domain.Entities.Planning.MarketScopingParameter
        {
            Id = Guid.NewGuid(),
            MarketScopingId = request.MarketScopingId,
            ParameterSettingsId = request.ParameterSettingsId,
            ParameterId = request.ParameterId,
            IsConsidered = request.IsConsidered,
            Remarks = request.Remarks,
            CreatedAt = DateTime.UtcNow,
        };

        // Add attachments to parameter
        foreach (var attachmentDto in request.Attachments)
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
        unitOfWork.MarketScopingRepository.Update(marketScoping);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new ApiResponse<Guid>
        {
            Succeeded = true,
            Data = parameter.Id,
            Message = "Market scoping parameter created successfully."
        };
    }
}
