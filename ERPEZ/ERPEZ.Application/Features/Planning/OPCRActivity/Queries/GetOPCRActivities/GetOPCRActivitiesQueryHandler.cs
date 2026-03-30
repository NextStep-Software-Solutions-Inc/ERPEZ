using System.Linq.Expressions;
using ERPEZ.Application.Features.Planning.OPCRActivity.Dtos;
using ERPEZ.Application.Features.Planning.Office.Dtos;
using ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Queries.GetOPCRActivities;

public class GetOPCRActivitiesQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOPCRActivitiesQuery, PaginatedApiResponse<OPCRActivityResponse>>
{
    public async Task<PaginatedApiResponse<OPCRActivityResponse>> Handle(GetOPCRActivitiesQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.OPCRActivity, OPCRActivityResponse>> projection = a => new OPCRActivityResponse
        {
            Id = a.Id,
            OPCRItemId = a.OPCRItemId,
            Name = a.Name,
            Description = a.Description,
            Budget = a.Budget,
            PAPDepartments = a.OPCRPAPDepartments.Select(p => new OPCRPAPDepartmentResponse()
            {
                Id = p.Id,
                OPCRActivityId = p.OPCRActivityId,
                Office = new OfficeResponse
                {
                    Id = p.Office!.Id,
                    Name = p.Office.Name,
                    Code = p.Office.Code,
                    Address = p.Office.Address,
                    Description = p.Office.Description,
                    ResponsibilityCenterCode = p.Office.ResponsibilityCenterCode,
                    ClusterId = p.Office.ClusterId,
                    Cluster = p.Office.Cluster == null ? null : new()
                    {
                        Id = p.Office.Cluster.Id,
                        Name = p.Office.Cluster.Name
                    }
                }
            }).ToList()
        };

        var (opcrActivities, totalCount) = await unitOfWork.OPCRActivityRepository.GetAllAsync(sieveModel, projection, cancellationToken);

        return new PaginatedApiResponse<OPCRActivityResponse>([.. opcrActivities], query.PageNumber,  query.PageSize, totalCount);
    }
}
