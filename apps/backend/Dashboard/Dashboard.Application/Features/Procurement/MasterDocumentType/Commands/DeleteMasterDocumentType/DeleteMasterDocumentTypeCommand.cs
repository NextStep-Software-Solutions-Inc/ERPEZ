using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.MasterDocumentType.Commands.DeleteMasterDocumentType;

public record DeleteMasterDocumentTypeCommand(Guid Id) : IRequest<ApiResponse<Unit>>;