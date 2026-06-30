using ERPEZ.Application.Features.Procurement.MasterDocumentType.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.MasterDocumentType.Queries.GetMasterDocumentTypeById;

public record GetMasterDocumentTypeByIdQuery(Guid Id)
    : IRequest<ApiResponse<MasterDocumentTypeDto>>;