using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.Contracts.Commands.ApproveContract;
using ERPEZ.Application.Features.Procurement.Contracts.Commands.CreateContract;
using ERPEZ.Application.Features.Procurement.Contracts.Commands.ReturnContract;
using ERPEZ.Application.Features.Procurement.Contracts.Commands.SubmitContract;
using ERPEZ.Application.Features.Procurement.Contracts.Commands.UpdateContract;
using ERPEZ.Application.Features.Procurement.Contracts.Queries.GetContractById;
using ERPEZ.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.Contracts;

public class ContractLifecycleEndToEndTests
{
    [Fact]
    public async Task FullContractLifecycle_FromDraftThroughApproval_ShouldMaintainDataIntegrity()
    {
        // 1. Arrange In-Memory Context & UnitOfWork
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);
        var (noa, supplier, project) = await ContractTestHelpers.SeedApprovedNoaAsync(context, awardedAmount: 1500000m);

        var staffId = Guid.NewGuid();
        var legalReviewerId = Guid.NewGuid();
        var approverId = Guid.NewGuid();

        var staffUserService = ContractTestHelpers.CreateCurrentUserService(userId: staffId.ToString(), name: "Jane Staff");
        var reviewerUserService = ContractTestHelpers.CreateCurrentUserService(userId: legalReviewerId.ToString(), name: "Atty. Santos");
        var approverUserService = ContractTestHelpers.CreateCurrentUserService(userId: approverId.ToString(), name: "Hon. HoPE Executive");

        // 2. Step 1: Create Contract Draft from Approved NOA
        var createHandler = new CreateContractCommandHandler(unitOfWork, staffUserService);
        var createCmd = new CreateContractCommand
        {
            NoticeOfAwardId = noa.Id,
            ContractNumber = "CONTRACT-E2E-001",
            ContractDate = new DateOnly(2026, 7, 1),
            Description = "Initial contract agreement package"
        };
        var createRes = await createHandler.Handle(createCmd, CancellationToken.None);
        createRes.Succeeded.Should().BeTrue();
        var contractId = createRes.Data;

        // 3. Step 2: Staff edits the Draft details
        var updateHandler = new UpdateContractCommandHandler(unitOfWork, staffUserService);
        var updateCmd = new UpdateContractCommand
        {
            Id = contractId,
            ContractNumber = "CONTRACT-E2E-001",
            ContractDate = new DateOnly(2026, 7, 2),
            Description = "Refined bilateral terms scope"
        };
        var updateRes = await updateHandler.Handle(updateCmd, CancellationToken.None);
        updateRes.Succeeded.Should().BeTrue();

        // 4. Step 3: Staff submits to ForApproval
        var submitHandler = new SubmitContractCommandHandler(unitOfWork, staffUserService);
        var submitCmd = new SubmitContractCommand(contractId);
        var submitRes = await submitHandler.Handle(submitCmd, CancellationToken.None);
        submitRes.Succeeded.Should().BeTrue();

        var stateAfterSubmit = await unitOfWork.ContractRepository.GetByIdAsync(contractId);
        stateAfterSubmit!.Status.Should().Be(ContractStatus.ForApproval);
        stateAfterSubmit.SubmittedById.Should().Be(staffId);
        stateAfterSubmit.SubmittedAt.Should().NotBeNull();

        // 5. Step 4: Legal Reviewer returns contract with remarks
        var returnHandler = new ReturnContractCommandHandler(unitOfWork, reviewerUserService);
        var returnCmd = new ReturnContractCommand(contractId, "Please adjust section 8 warranty duration to 12 months.");
        var returnRes = await returnHandler.Handle(returnCmd, CancellationToken.None);
        returnRes.Succeeded.Should().BeTrue();

        var stateAfterReturn = await unitOfWork.ContractRepository.GetByIdAsync(contractId);
        stateAfterReturn!.Status.Should().Be(ContractStatus.Returned);
        stateAfterReturn.ReturnRemarks.Should().Be("Please adjust section 8 warranty duration to 12 months.");
        stateAfterReturn.ReturnedById.Should().Be(legalReviewerId);

        // 6. Step 5: Staff fixes description and resubmits
        var updateAfterReturnCmd = new UpdateContractCommand
        {
            Id = contractId,
            ContractNumber = "CONTRACT-E2E-001",
            ContractDate = new DateOnly(2026, 7, 3),
            Description = "Refined terms with 12 months warranty specified"
        };
        var updateAfterReturnRes = await updateHandler.Handle(updateAfterReturnCmd, CancellationToken.None);
        updateAfterReturnRes.Succeeded.Should().BeTrue();

        var resubmitCmd = new SubmitContractCommand(contractId);
        var resubmitRes = await submitHandler.Handle(resubmitCmd, CancellationToken.None);
        resubmitRes.Succeeded.Should().BeTrue();

        // 7. Step 6: HoPE / Approving Authority approves the contract
        var approveHandler = new ApproveContractCommandHandler(unitOfWork, approverUserService);
        var approveCmd = new ApproveContractCommand(contractId, "Approved as legally compliant and aligned with BAC Resolution.");
        var approveRes = await approveHandler.Handle(approveCmd, CancellationToken.None);
        approveRes.Succeeded.Should().BeTrue();

        // 8. Step 7: Query full details and verify normalization invariants
        var getByIdHandler = new GetContractByIdQueryHandler(unitOfWork);
        var queryRes = await getByIdHandler.Handle(new GetContractByIdQuery(contractId), CancellationToken.None);
        queryRes.Succeeded.Should().BeTrue();

        var detail = queryRes.Data;
        detail.Should().NotBeNull();
        detail!.Status.Should().Be(ContractStatus.Approved);
        detail.Status.Should().NotBe(ContractStatus.Executed); // Execution is Phase 4
        detail.ApprovedByName.Should().Be("Hon. HoPE Executive");
        detail.ApprovalRemarks.Should().Be("Approved as legally compliant and aligned with BAC Resolution.");
        detail.ReturnRemarks.Should().Be("Please adjust section 8 warranty duration to 12 months.");

        // Authoritative NOA Projections
        detail.SupplierId.Should().Be(supplier.Id);
        detail.SupplierName.Should().Be("Acme Technologies Inc.");
        detail.ProcurementProjectId.Should().Be(project.Id);
        detail.ProjectTitle.Should().Be("IT Infrastructure & Server Upgrade");
        detail.TotalAmount.Should().Be(1500000m);
    }
}
