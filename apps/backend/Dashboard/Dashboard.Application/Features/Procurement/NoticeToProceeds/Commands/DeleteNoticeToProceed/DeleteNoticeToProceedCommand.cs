using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.DeleteNoticeToProceed;

public record DeleteNoticeToProceedCommand(Guid Id) : IRequest<ApiResponse<bool>>;
