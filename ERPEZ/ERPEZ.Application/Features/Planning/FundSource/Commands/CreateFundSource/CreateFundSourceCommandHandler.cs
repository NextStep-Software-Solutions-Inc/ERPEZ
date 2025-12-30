using ERPEZ.Application.Features.Planning.FundSource.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FundSource.Commands.CreateFundSource;

public class CreateFundSourceCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateFundSourceCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateFundSourceCommand request, CancellationToken cancellationToken)
    {
        if (request.ParentId.HasValue)
        {
            _ = await unitOfWork.FundSourceRepository.GetByIdAsync(request.ParentId.Value, cancellationToken) ?? throw new NotFoundException($"Parent Fund Source with the specified ID ({request.ParentId.Value}) does not exist.");
        }

        var fundSourceType = Enum.Parse<FundSourceTypeEnum>(request.Type);
        var fundSourceExist = await unitOfWork.FundSourceRepository.FindAsync(t => t.Name == request.Name && t.Type == fundSourceType, cancellationToken: cancellationToken);
        if (fundSourceExist != null) throw new ConflictException("Fund Source already exists.");
        var fundSource = new Domain.Entities.Planning.FundSource
        {
            ParentId = request.ParentId,
            Name = request.Name,
            Code = request.Code,
            Type = fundSourceType,
            IsActive = request.IsActive
        };

        await unitOfWork.FundSourceRepository.AddAsync(fundSource, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(fundSource.Id, "Fund Source created successfully.");
    }
}
