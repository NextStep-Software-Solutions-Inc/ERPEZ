using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Queries.GetLIBActivityObjects;

public record LIBActivityDetailRawProjection
{
    public Guid ObjectId { get; init; }
    public string ChildCode { get; init; } = string.Empty;
    public string ChildName { get; init; } = string.Empty;
    public Guid? ParentId { get; init; }
    public string? ParentCode { get; init; }
    public string? ParentName { get; init; }
    public Guid? GrandParentId { get; init; }
    public string? GrandParentCode { get; init; }
    public string? GrandParentName { get; init; }
    public Guid? ExpenseClassId { get; init; }
    public string? ExpenseClassName { get; init; }
    public string? ExpenseClassCode { get; init; }
    public decimal Budget { get; init; }
}

public class GetLIBActivityObjectsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetLIBActivityObjectsQuery, ApiResponse<List<LIBActivityObjectResponse>>>
{
    public async Task<ApiResponse<List<LIBActivityObjectResponse>>> Handle(
        GetLIBActivityObjectsQuery request, CancellationToken cancellationToken)
    {
        var rawDetails = await unitOfWork.LineItemBudgetDetailRepository.ToListAsync(
            unitOfWork.LineItemBudgetDetailRepository
                .Query(x => x.LineItemBudgetActivityId == request.LIBActivityId && !x.IsDeleted)
                .Select(x => new LIBActivityDetailRawProjection
                {
                    ObjectId = x.ObjectId,
                    ChildCode = x.Object.Code,
                    ChildName = x.Object.Name,
                    ParentId = (Guid?)x.Object.ParentId,
                    ParentCode = x.Object.ParentObject != null ? x.Object.ParentObject.Code : null,
                    ParentName = x.Object.ParentObject != null ? x.Object.ParentObject.Name : null,
                    GrandParentId = x.Object.ParentObject != null ? (Guid?)x.Object.ParentObject.ParentId : null,
                    GrandParentCode = x.Object.ParentObject != null && x.Object.ParentObject.ParentObject != null ? x.Object.ParentObject.ParentObject.Code : null,
                    GrandParentName = x.Object.ParentObject != null && x.Object.ParentObject.ParentObject != null ? x.Object.ParentObject.ParentObject.Name : null,
                    ExpenseClassId = x.Object.ObjectExpenseClasses.Where(oc => oc.IsActive).Select(oc => (Guid?)oc.ExpenseClassId).FirstOrDefault(),
                    ExpenseClassName = x.Object.ObjectExpenseClasses.Where(oc => oc.IsActive).Select(oc => oc.ExpenseClass!.Name).FirstOrDefault(),
                    ExpenseClassCode = x.Object.ObjectExpenseClasses.Where(oc => oc.IsActive).Select(oc => oc.ExpenseClass!.Code).FirstOrDefault(),
                    Budget = x.Budget
                }),
            cancellationToken);

        static bool IsRootNode(string? code, string? name)
        {
            if (string.IsNullOrWhiteSpace(code) && string.IsNullOrWhiteSpace(name))
                return true;

            return string.Equals(name, "Expenses", StringComparison.OrdinalIgnoreCase) ||
                   string.Equals(code, "CLS:Expenses", StringComparison.OrdinalIgnoreCase) ||
                   code == "50000000" ||
                   (code != null && code.StartsWith("50000000"));
        }

        var parentGroups = rawDetails
            .Select(d =>
            {
                Guid parentId;
                string parentCode;
                string parentName;

                if (!string.IsNullOrWhiteSpace(d.GrandParentName) && !IsRootNode(d.GrandParentCode, d.GrandParentName))
                {
                    parentId = d.GrandParentId ?? d.ParentId ?? d.ObjectId;
                    parentCode = d.GrandParentCode ?? d.ParentCode ?? d.ChildCode;
                    parentName = d.GrandParentName;
                }
                else if (!string.IsNullOrWhiteSpace(d.ParentName) && !IsRootNode(d.ParentCode, d.ParentName))
                {
                    parentId = d.ParentId ?? d.ObjectId;
                    parentCode = d.ParentCode ?? d.ChildCode;
                    parentName = d.ParentName;
                }
                else if (d.ExpenseClassId.HasValue && !string.IsNullOrWhiteSpace(d.ExpenseClassName))
                {
                    parentId = d.ExpenseClassId.Value;
                    parentCode = d.ExpenseClassCode ?? string.Empty;
                    parentName = d.ExpenseClassName;
                }
                else
                {
                    parentId = d.ObjectId;
                    parentCode = d.ChildCode;
                    parentName = d.ChildName;
                }

                return new
                {
                    ParentId = parentId,
                    ParentCode = parentCode,
                    ParentName = parentName,
                    ChildId = d.ObjectId,
                    ChildCode = d.ChildCode,
                    ChildName = d.ChildName,
                    d.Budget
                };
            })
            .GroupBy(x => new { x.ParentId, x.ParentCode, x.ParentName })
            .Select(pg => new LIBActivityObjectResponse
            {
                ParentObjectId = pg.Key.ParentId,
                ParentObjectCode = pg.Key.ParentCode,
                ParentObjectName = pg.Key.ParentName,
                Items = pg.GroupBy(c => new { c.ChildId, c.ChildCode, c.ChildName })
                    .Select(cg => new LIBActivityObjectItemResponse
                    {
                        Id = cg.Key.ChildId,
                        Code = cg.Key.ChildCode,
                        Name = cg.Key.ChildName,
                        TotalBudget = cg.Sum(x => x.Budget)
                    })
                    .OrderBy(c => c.Code)
                    .ThenBy(c => c.Name)
                    .ToList()
            })
            .OrderBy(p => p.ParentObjectCode)
            .ThenBy(p => p.ParentObjectName)
            .ToList();

        return ApiResponse<List<LIBActivityObjectResponse>>.Success(parentGroups);
    }
}