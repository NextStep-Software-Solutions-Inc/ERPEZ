using System.Linq.Expressions;
using ERPEZ.Application.Features.Planning.Object.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Object.Queries.GetObjects;

public class GetObjectsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetObjectsQuery, PaginatedApiResponse<ObjectResponse>>
{
    public async Task<PaginatedApiResponse<ObjectResponse>> Handle(GetObjectsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        // Add fiscal year filter to Sieve filters if provided
        if (query.FiscalYearId.HasValue)
        {
            var fiscalYearFilter = $"FiscalYearId=={query.FiscalYearId.Value}";
            sieveModel.Filters = string.IsNullOrEmpty(sieveModel.Filters) 
                ? fiscalYearFilter 
                : $"{sieveModel.Filters},{fiscalYearFilter}";
        }

        Expression<Func<Domain.Entities.Planning.Object, ObjectResponse>> projection = obj => new ObjectResponse
        {
            Id = obj.Id,
            Name = obj.Name,
            Code = obj.Code,
            IsActive = obj.IsActive,
            FiscalYearId = obj.FiscalYearId,
            ChildObjectCount = obj.ChildObjects.Count,
            WFPObjectiveActivityExpenditureCount = obj.WFPObjectiveActivityExpenditures.Count,
            TransactionCount = obj.Transactions.Count,
            Parent = obj.ParentObject != null ? new ObjectResponse
            {
                Id = obj.ParentObject.Id,
                Name = obj.ParentObject.Name,
                Code = obj.ParentObject.Code,
                IsActive = obj.ParentObject.IsActive,
                ChildObjectCount = obj.ParentObject.ChildObjects.Count,
                WFPObjectiveActivityExpenditureCount = obj.ParentObject.WFPObjectiveActivityExpenditures.Count,
                TransactionCount = obj.ParentObject.Transactions.Count,
                Parent = obj.ParentObject.ParentObject != null ? new ObjectResponse
                {
                    Id = obj.ParentObject.ParentObject.Id,
                    Name = obj.ParentObject.ParentObject.Name,
                    Code = obj.ParentObject.ParentObject.Code,
                    IsActive = obj.ParentObject.ParentObject.IsActive,
                    ChildObjectCount = obj.ParentObject.ParentObject.ChildObjects.Count,
                    WFPObjectiveActivityExpenditureCount = obj.ParentObject.ParentObject.WFPObjectiveActivityExpenditures.Count,
                    TransactionCount = obj.ParentObject.ParentObject.Transactions.Count,
                    Parent = obj.ParentObject.ParentObject.ParentObject != null ? new ObjectResponse
                    {
                        Id = obj.ParentObject.ParentObject.ParentObject.Id,
                        Name = obj.ParentObject.ParentObject.ParentObject.Name,
                        Code = obj.ParentObject.ParentObject.ParentObject.Code,
                        IsActive = obj.ParentObject.ParentObject.ParentObject.IsActive,
                        ChildObjectCount = obj.ParentObject.ParentObject.ParentObject.ChildObjects.Count,
                        WFPObjectiveActivityExpenditureCount = obj.ParentObject.ParentObject.ParentObject.WFPObjectiveActivityExpenditures.Count,
                        TransactionCount = obj.ParentObject.ParentObject.ParentObject.Transactions.Count
                    }: null
                }: null
            } : null
        };

        var (objectives, totalCount) = await unitOfWork.ObjectRepository.GetAllAsync(sieveModel, projection, cancellationToken);
        return new PaginatedApiResponse<ObjectResponse>(
            [.. objectives],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
