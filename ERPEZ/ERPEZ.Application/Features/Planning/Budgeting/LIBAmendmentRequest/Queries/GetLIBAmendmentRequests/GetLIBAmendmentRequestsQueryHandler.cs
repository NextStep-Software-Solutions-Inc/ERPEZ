using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Queries.GetLIBAmendmentRequests;

public class GetLIBAmendmentRequestsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetLIBAmendmentRequestsQuery, PaginatedApiResponse<LIBAmendmentRequestResponse>>
{
    public async Task<PaginatedApiResponse<LIBAmendmentRequestResponse>> Handle(GetLIBAmendmentRequestsQuery request, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            Page = request.PageNumber,
            PageSize = request.PageSize,
            Filters = request.Filters,
            Sorts = request.Sorts
        };

        var (entities, totalCount) = await unitOfWork.LIBAmendmentRequestRepository
            .GetAllWithDetailsAsync(sieveModel, cancellationToken);

        var items = entities.Select(entity => new LIBAmendmentRequestResponse
                {
                    Id = entity.Id,
                    LineItemBudgetId = entity.LineItemBudgetId,
                    ProposedLineItemBudgetId = entity.ProposedLineItemBudgetId,
                    Reason = Enum.Parse<LIBAmendmentReasonEnum>(entity.Reason, true),
                    Justification = entity.Justification,
                    Status = Enum.Parse<LIBAmendmentStatusEnum>(entity.Status, true),
                    LineItemBudget = entity.LineItemBudget == null ? null : new LIBAmendmentRequestLIBResponse
                    {
                        Id = entity.LineItemBudget.Id,
                        LIBNumber = entity.LineItemBudget.LIBNumber,
                        Name = entity.LineItemBudget.Name ?? string.Empty,
                        Version = entity.LineItemBudget.Version
                    },
                    ProposedLineItemBudget = entity.ProposedLineItemBudget == null ? null : new LIBAmendmentRequestLIBResponse
                    {
                        Id = entity.ProposedLineItemBudget.Id,
                        LIBNumber = entity.ProposedLineItemBudget.LIBNumber,
                        Name = entity.ProposedLineItemBudget.Name ?? string.Empty,
                        Version = entity.ProposedLineItemBudget.Version
                    }
                })
            .ToList();

        return new PaginatedApiResponse<LIBAmendmentRequestResponse>(items, request.PageNumber, request.PageSize, totalCount);
    }
}

