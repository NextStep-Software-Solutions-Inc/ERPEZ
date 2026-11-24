using ERPEZ.Application.Features.Procurement.DocumentProfile.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DocumentProfile.Queries.GetDocumentProfileById;

public record GetDocumentProfileByIdQuery(Guid Id)
    : IRequest<ApiResponse<DocumentProfileDto>>;