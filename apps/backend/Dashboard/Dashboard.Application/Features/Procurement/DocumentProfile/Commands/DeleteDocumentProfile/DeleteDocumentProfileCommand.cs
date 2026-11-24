using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DocumentProfile.Commands.DeleteDocumentProfile;

public record DeleteDocumentProfileCommand(Guid Id) : IRequest<ApiResponse<Unit>>;