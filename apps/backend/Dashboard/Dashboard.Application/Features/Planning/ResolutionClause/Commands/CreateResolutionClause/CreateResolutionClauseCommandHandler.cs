using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ResolutionClause.Commands.CreateResolutionClause;

public class CreateResolutionClauseCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateResolutionClauseCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateResolutionClauseCommand request, CancellationToken cancellationToken)
    {
        var entity = new Domain.Entities.Planning.ResolutionClause
        {
            Name = request.Name,
            Body = request.Body,
            ClauseType = string.IsNullOrWhiteSpace(request.ClauseType) ? "Whereas" : request.ClauseType
        };

        await unitOfWork.ResolutionClauseRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "Resolution clause created successfully.");
    }
}
