using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Contracts.Queries.GetContractPdf;

public record ContractPdfFileResult(byte[] FileBytes, string FileName, string ContentType);

public record GetContractPdfQuery(Guid ContractId) : IRequest<ApiResponse<ContractPdfFileResult>>;