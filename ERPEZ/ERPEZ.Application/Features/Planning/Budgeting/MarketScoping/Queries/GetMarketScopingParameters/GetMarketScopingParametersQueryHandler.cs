using ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Queries.GetMarketScopingParameters;

public class GetMarketScopingParametersQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetMarketScopingParametersQuery, PaginatedApiResponse<MarketScopingParameterResponse>>
{
    public async Task<PaginatedApiResponse<MarketScopingParameterResponse>> Handle(
        GetMarketScopingParametersQuery request,
        CancellationToken cancellationToken)
    {
        var marketScoping = await unitOfWork.MarketScopingRepository.GetByIdAsync(request.MarketScopingId, cancellationToken)
            ?? throw new NotFoundException($"Market Scoping with ID {request.MarketScopingId} not found.");

        var query = unitOfWork.MarketScopingRepository.Query()
            .Where(ms => ms.Id == request.MarketScopingId)
            .SelectMany(ms => ms.ParameterEvaluations);

        var totalCount = query.Count();
        var parameters = query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        var response = parameters.Select(p => new MarketScopingParameterResponse
        {
            Id = p.Id,
            ParameterId = p.ParameterId,
            IsConsidered = p.IsConsidered,
            Remarks = p.Remarks,
            Attachments = p.Attachments.Select(att => new MarketScopingParameterAttachmentResponse
            {
                Id = att.Id,
                FileUrl = att.FileUrl,
                FileName = att.FileName,
            }).ToList(),
        }).ToList();

        return new PaginatedApiResponse<MarketScopingParameterResponse>(
            response,
            request.PageNumber,
            request.PageSize,
            totalCount
        );
    }
}
