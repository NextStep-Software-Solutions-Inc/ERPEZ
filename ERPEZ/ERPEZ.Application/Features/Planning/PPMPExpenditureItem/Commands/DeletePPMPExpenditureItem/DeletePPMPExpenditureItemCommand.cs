using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Commands.DeletePPMPExpenditureItem;

public record DeletePPMPExpenditureItemCommand(Guid Id) : IRequest<ApiResponse<Guid>>;
