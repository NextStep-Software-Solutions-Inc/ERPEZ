    using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
    using ERPEZ.Domain.Entities.Procurement;
    using ERPEZ.Domain.Enums;
    using ERPEZ.Domain.Interfaces;
    using ERPEZ.Shared.Common;
    using ERPEZ.Shared.Exceptions;
    using MediatR;

    namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.CreatePR;

    public class CreatePRCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreatePRCommand, ApiResponse<Guid>>
    {
        public async Task<ApiResponse<Guid>> Handle(CreatePRCommand request, CancellationToken cancellationToken)
        {
            Guid createdPrId = Guid.Empty;

            var isolationLevel = System.Data.IsolationLevel.Serializable;

            try
            {
                await unitOfWork.ExecuteInTransactionAsync(async () =>
                {
                    _ = await unitOfWork.OfficeRepository.GetByIdAsync(request.OfficeId, cancellationToken)
                        ?? throw new NotFoundException($"Office with ID {request.OfficeId} not found.");

                    if (request.FundSourceId.HasValue)
                        _ = await unitOfWork.FundSourceRepository.GetByIdAsync(request.FundSourceId.Value, cancellationToken)
                            ?? throw new NotFoundException($"Fund Source with ID {request.FundSourceId.Value} not found.");

                    if (request.ProcurementCategoryId.HasValue)
                        _ = await unitOfWork.ProcurementCategoryRepository.GetByIdAsync(request.ProcurementCategoryId.Value, cancellationToken)
                            ?? throw new NotFoundException($"Procurement Category with ID {request.ProcurementCategoryId.Value} not found.");

                    if (request.PPMPId.HasValue)
                        _ = await unitOfWork.PPMPRepository.GetByIdAsync(request.PPMPId.Value, cancellationToken)
                            ?? throw new NotFoundException($"PPMP with ID {request.PPMPId.Value} not found.");

                    if (request.APRId.HasValue)
                        _ = await unitOfWork.APRRepository.GetByIdAsync(request.APRId.Value, cancellationToken)
                            ?? throw new NotFoundException($"APR with ID {request.APRId.Value} not found.");

                    var existing = await unitOfWork.PurchaseRequestRepository.FindAsync(
                        x => x.PRNumber == request.PRNumber && !x.IsDeleted, cancellationToken);

                    if (existing is not null)
                        throw new ConflictException($"A Purchase Request with number '{request.PRNumber}' already exists.");

                    var prItems = new List<PRItem>();
                    decimal totalAmount = 0;
                    Guid? resolvedAprId = request.APRId;

                    foreach (var itemRequest in request.Items)
                    {
                        var (resolvedPpmpItemId, itemAprId) = await PRItemValidationHelper.ValidatePRItemAsync(
                            unitOfWork,
                            request.PRType,
                            request.OfficeId,
                            itemRequest,
                            currentPRId: null,
                            cancellationToken);

                        resolvedAprId ??= itemAprId;

                        var prItem = PRItemValidationHelper.BuildPRItem(itemRequest, resolvedPpmpItemId);
                        prItems.Add(prItem);
                        totalAmount += prItem.Amount;
                    }

                    var pr = new PurchaseRequest
                    {
                        PRNumber              = request.PRNumber,
                        Description           = request.Description,
                        Purpose               = request.Purpose,
                        PRType                = request.PRType,
                        OfficeId              = request.OfficeId,
                        PPMPId                = request.PPMPId,
                        APRId                 = resolvedAprId,
                        FundSourceId         = request.FundSourceId,
                        UACSCodeCombinationId = request.UACSCodeCombinationId,
                        ProcurementCategoryId = request.ProcurementCategoryId,
                        RequestedDate         = request.RequestedDate,
                        TotalAmount           = totalAmount,
                        Status                = StatusEnum.Draft,
                        PRItems               = prItems
                    };

                    await unitOfWork.PurchaseRequestRepository.AddAsync(pr, cancellationToken);
                    await unitOfWork.SaveChangesAsync(cancellationToken);
                    createdPrId = pr.Id;
                }, isolationLevel, cancellationToken);
            }
            catch (Exception ex) when (ex.Message.Contains("40001") || ex.InnerException?.Message.Contains("40001") == true)
            {
                throw new ConflictException("A concurrent transaction modified the available APR item deficit. Please refresh and try again.");
            }

            return ApiResponse<Guid>.Success(createdPrId, "Purchase Request created successfully.");
        }
    }