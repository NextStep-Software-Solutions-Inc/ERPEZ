using ERPEZ.Application.Features.Planning.FundSource.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FundSource.Commands.CreateFundSource;

public class CreateFundSourceCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateFundSourceCommand, ApiResponse<FundSourceResponse>>
{
    public async Task<ApiResponse<FundSourceResponse>> Handle(CreateFundSourceCommand request, CancellationToken cancellationToken)
    {
        if (request.ParentId.HasValue)
        {
            _ = await unitOfWork.FundSourceRepository.GetByIdAsync(request.ParentId.Value, cancellationToken) 
                ?? throw new NotFoundException($"Parent Fund Source with the specified ID ({request.ParentId.Value}) does not exist.");
        }
        var fundSourceExist = await unitOfWork.FundSourceRepository.FindAsync(t => t.Name == request.Name && t.Type == request.Type, cancellationToken: cancellationToken);
        if (fundSourceExist != null) throw new ConflictException("Fund Source already exists.");
        var fundSource = new Domain.Entities.Planning.FundSource
        {
            ParentId = request.ParentId,
            Name = request.Name,
            Code = request.Code,
            Type = request.Type,
            IsActive = request.IsActive
        };

        await unitOfWork.FundSourceRepository.AddAsync(fundSource, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var result = new FundSourceResponse()
        {
            Id = fundSource.Id,
            ParentId = fundSource.ParentId,
            Name = fundSource.Name,
            Code = fundSource.Code,
            Type = fundSource.Type,
            IsActive = fundSource.IsActive,
            CreatedBy = fundSource.CreatedBy,
            CreatedAt = fundSource.CreatedAt
        };
        return ApiResponse<FundSourceResponse>.Success(result, "Fund Source created successfully.");
    }
}
