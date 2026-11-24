using System.Linq.Expressions;
using ERPEZ.Application.Common.Dtos;
using ERPEZ.Application.Common.Helpers;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using ERPEZ.Application.Features.Planning.Document.Commands.GenerateAPP;
using ERPEZ.Application.Features.Planning.Document.Commands.GenerateConsolidatedOPCR;
using ERPEZ.Application.Features.Planning.Document.Commands.GenerateLIB;
using ERPEZ.Application.Features.Planning.Document.Commands.GenerateMarketScoping;
using ERPEZ.Application.Features.Planning.Document.Commands.GenerateOPCR;
using ERPEZ.Application.Features.Planning.Document.Commands.GenerateOPCRRating;
using ERPEZ.Application.Features.Planning.Document.Commands.GeneratePPMP;
using ERPEZ.Application.Features.Planning.Document.Commands.GenerateWFP;
using ERPEZ.Application.Features.Planning.Document.Dtos;
using ERPEZ.Application.Features.Planning.PPMP.Commands.ApprovePPMP;
using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.ChangeAPRStatus;
using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.GenerateAprDocument;
using ERPEZ.Application.Features.Procurement.AOBs.Common;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.Utils;
using ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.GeneratePurchaseRequestDocument;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Persistence;
using ERPEZ.Infrastructure.Persistence.Seeders;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace ERPEZ.Application.UnitTests.Features.Common;

public class ApprovalAndDocumentSignatoryGenerationTests
{
    private sealed class SignatoryTestFixture
    {
        public Mock<IUnitOfWork> UnitOfWorkMock { get; } = new();
        public Mock<IDocumentRendererService> RendererMock { get; } = new();
        public Mock<IDocumentStorageService> StorageMock { get; } = new();

        public Guid FiscalYearId { get; } = Guid.NewGuid();
        public Guid MainOfficeId { get; } = Guid.NewGuid();
        public Guid FmsOfficeId { get; } = Guid.NewGuid();
        public Guid SpmoOfficeId { get; } = Guid.NewGuid();

        public FiscalYear FiscalYear { get; }
        public Organization Organization { get; }
        public Office MainOffice { get; }
        public Office FmsOffice { get; }
        public Office SpmoOffice { get; }

        public Position HopePosition { get; }
        public Position RecommendingPosition { get; }
        public Position FinancePosition { get; }
        public Position SupplyPosition { get; }
        public Position EndUserPosition { get; }
        public Position TechRepPosition { get; }

        public User HopeUser { get; }
        public User RecommendingUser { get; }
        public User FinanceUser { get; }
        public User SupplyUser { get; }
        public User EndUser { get; }
        public User TechRepUser { get; }

        public List<Position> Positions { get; }
        public List<User> Users { get; }
        public List<PersonnelPosition> PersonnelPositions { get; }
        public List<WorkflowMatrix> WorkflowMatrices { get; }
        public List<BACMember> BacMembers { get; }
        public PMT Pmt { get; }
        public List<PMTMember> PmtMembers { get; }

        public SignatoryTestFixture()
        {
            FiscalYear = new FiscalYear
            {
                Id = FiscalYearId,
                Year = 2026,
                Description = "FY 2026",
                Status = "Active"
            };

            Organization = new Organization
            {
                Id = Guid.NewGuid(),
                Name = "Mindanao State University",
                Code = "MSU",
                Type = "Agency",
                IsActive = true,
                FiscalYearId = FiscalYearId
            };

            MainOffice = new Office
            {
                Id = MainOfficeId,
                Name = "College of Information Technology",
                Code = "CIT",
                OrganizationId = Organization.Id,
                Organization = Organization
            };

            FmsOffice = new Office
            {
                Id = FmsOfficeId,
                Name = "Financial Management Services",
                Code = "FMS",
                OrganizationId = Organization.Id,
                Organization = Organization
            };

            SpmoOffice = new Office
            {
                Id = SpmoOfficeId,
                Name = "Supply and Property Management Office",
                Code = "SPMO",
                OrganizationId = Organization.Id,
                Organization = Organization
            };

            HopePosition = new Position
            {
                Id = Guid.NewGuid(),
                Code = "POS-HOPE",
                Title = "Head of the Procuring Entity",
                FunctionalTitle = "University President",
                OfficeId = MainOfficeId,
                Office = MainOffice
            };

            RecommendingPosition = new Position
            {
                Id = Guid.NewGuid(),
                Code = "POS-REC",
                Title = "Campus Chancellor",
                FunctionalTitle = "Vice President for Planning and Development",
                OfficeId = MainOfficeId,
                Office = MainOffice
            };

            FinancePosition = new Position
            {
                Id = Guid.NewGuid(),
                Code = "POS-FIN",
                Title = "Budget Officer",
                FunctionalTitle = "Director, Financial Management Services",
                OfficeId = FmsOfficeId,
                Office = FmsOffice
            };

            SupplyPosition = new Position
            {
                Id = Guid.NewGuid(),
                Code = "POS-SUP",
                Title = "Agency Property/Supply Officer",
                FunctionalTitle = "Head, Supply and Property Management Office",
                OfficeId = SpmoOfficeId,
                Office = SpmoOffice
            };

            EndUserPosition = new Position
            {
                Id = Guid.NewGuid(),
                Code = "POS-EU",
                Title = "Department Chairperson",
                FunctionalTitle = "End-User Representative",
                OfficeId = MainOfficeId,
                Office = MainOffice
            };

            TechRepPosition = new Position
            {
                Id = Guid.NewGuid(),
                Code = "POS-TECH",
                Title = "IT Officer III",
                FunctionalTitle = "Technical Working Group Representative",
                OfficeId = MainOfficeId,
                Office = MainOffice
            };

            HopeUser = new User
            {
                Id = Guid.NewGuid(),
                EmployeeNumber = "EMP-001",
                Username = "hope.user",
                FirstName = "DR. ALEJANDRO",
                MiddleName = "V.",
                LastName = "DELA CRUZ",
                OfficeId = MainOfficeId,
                Office = MainOffice,
                IsActive = true
            };

            RecommendingUser = new User
            {
                Id = Guid.NewGuid(),
                EmployeeNumber = "EMP-002",
                Username = "rec.user",
                FirstName = "DR. MARIA",
                MiddleName = "L.",
                LastName = "FERNANDEZ",
                OfficeId = MainOfficeId,
                Office = MainOffice,
                IsActive = true
            };

            FinanceUser = new User
            {
                Id = Guid.NewGuid(),
                EmployeeNumber = "EMP-003",
                Username = "fin.user",
                FirstName = "HONORATA",
                MiddleName = "S.",
                LastName = "BAUTISTA, CPA",
                OfficeId = FmsOfficeId,
                Office = FmsOffice,
                IsActive = true
            };

            SupplyUser = new User
            {
                Id = Guid.NewGuid(),
                EmployeeNumber = "EMP-004",
                Username = "sup.user",
                FirstName = "ERNESTO",
                MiddleName = "P.",
                LastName = "RAMOS",
                OfficeId = SpmoOfficeId,
                Office = SpmoOffice,
                IsActive = true
            };

            EndUser = new User
            {
                Id = Guid.NewGuid(),
                EmployeeNumber = "EMP-005",
                Username = "end.user",
                FirstName = "PROF. MIGUEL",
                MiddleName = "R.",
                LastName = "SORIANO",
                OfficeId = MainOfficeId,
                Office = MainOffice,
                IsActive = true
            };

            TechRepUser = new User
            {
                Id = Guid.NewGuid(),
                EmployeeNumber = "EMP-006",
                Username = "tech.user",
                FirstName = "ENGR. DIANA",
                MiddleName = "C.",
                LastName = "LIM",
                OfficeId = MainOfficeId,
                Office = MainOffice,
                IsActive = true
            };

            Positions = [HopePosition, RecommendingPosition, FinancePosition, SupplyPosition, EndUserPosition, TechRepPosition];
            Users = [HopeUser, RecommendingUser, FinanceUser, SupplyUser, EndUser, TechRepUser];

            PersonnelPositions =
            [
                CreateAssignment(HopeUser, HopePosition),
                CreateAssignment(RecommendingUser, RecommendingPosition),
                CreateAssignment(FinanceUser, FinancePosition),
                CreateAssignment(SupplyUser, SupplyPosition),
                CreateAssignment(EndUser, EndUserPosition),
                CreateAssignment(TechRepUser, TechRepPosition)
            ];

            WorkflowMatrices =
            [
                new WorkflowMatrix
                {
                    Id = Guid.NewGuid(),
                    FiscalYearId = FiscalYearId,
                    OfficeId = MainOfficeId,
                    DocumentType = null,
                    Status = "Active",
                    RecommendingApproverPositionId = RecommendingPosition.Id,
                    RecommendingApproverPosition = RecommendingPosition,
                    FinalApproverPositionId = HopePosition.Id,
                    FinalApproverPosition = HopePosition
                }
            ];

            BacMembers =
            [
                new BACMember
                {
                    Id = Guid.NewGuid(),
                    FullName = "ENGR. CARLOS M. REYES, Ph.D.",
                    Position = "BAC Chairperson",
                    Role = "Chairperson",
                    Order = 1,
                    IsActive = true
                },
                new BACMember
                {
                    Id = Guid.NewGuid(),
                    FullName = "ATTY. ELENA G. SANTOS",
                    Position = "BAC Vice-Chairperson",
                    Role = "ViceChairperson",
                    Order = 2,
                    IsActive = true
                },
                new BACMember
                {
                    Id = Guid.NewGuid(),
                    FullName = "DR. ROBERTO L. MENDOZA",
                    Position = "BAC Regular Member",
                    Role = "RegularMember",
                    Order = 3,
                    IsActive = true
                },
                new BACMember
                {
                    Id = Guid.NewGuid(),
                    FullName = "MS. PATRICIA A. CRUZ, CPA",
                    Position = "BAC Regular Member",
                    Role = "RegularMember",
                    Order = 4,
                    IsActive = true
                }
            ];

            Pmt = new PMT
            {
                Id = Guid.NewGuid(),
                OrganizationId = Organization.Id,
                ActiveYear = 2026,
                IsActive = true
            };

            PmtMembers =
            [
                new PMTMember
                {
                    Id = Guid.NewGuid(),
                    PMTId = Pmt.Id,
                    PMT = Pmt,
                    UserId = RecommendingUser.Id,
                    User = RecommendingUser,
                    Role = nameof(PMTRoleEnum.Chair),
                    IsActive = true
                },
                new PMTMember
                {
                    Id = Guid.NewGuid(),
                    PMTId = Pmt.Id,
                    PMT = Pmt,
                    UserId = FinanceUser.Id,
                    User = FinanceUser,
                    Role = nameof(PMTRoleEnum.ViceChair),
                    IsActive = true
                },
                new PMTMember
                {
                    Id = Guid.NewGuid(),
                    PMTId = Pmt.Id,
                    PMT = Pmt,
                    UserId = EndUser.Id,
                    User = EndUser,
                    Role = nameof(PMTRoleEnum.Member),
                    IsActive = true
                }
            ];

            ConfigureMocks();
        }

        private static PersonnelPosition CreateAssignment(User user, Position position)
        {
            var pp = new PersonnelPosition
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                User = user,
                PositionId = position.Id,
                Position = position,
                AssignmentType = nameof(AssignmentTypeEnum.Permanent),
                IsActive = true,
                StartDate = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            };
            user.PersonnelPositions.Add(pp);
            return pp;
        }

        private void ConfigureMocks()
        {
            StorageMock
                .Setup(s => s.SaveAsync(It.IsAny<byte[]>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync("/storage/test.pdf");

            var genDocRepo = new Mock<IGeneratedDocumentRepository>();
            genDocRepo
                .Setup(r => r.AddAsync(It.IsAny<GeneratedDocument>(), It.IsAny<CancellationToken>()))
                .Callback<GeneratedDocument, CancellationToken>((doc, _) =>
                {
                    if (doc.Id == Guid.Empty) doc.Id = Guid.NewGuid();
                })
                .Returns(Task.CompletedTask);
            UnitOfWorkMock.Setup(u => u.GeneratedDocumentRepository).Returns(genDocRepo.Object);

            // WorkflowMatrixRepository
            var wfRepo = new Mock<IWorkflowMatrixRepository>();
            wfRepo
                .Setup(r => r.FindAllAsync(It.IsAny<Expression<Func<WorkflowMatrix, bool>>>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((Expression<Func<WorkflowMatrix, bool>> pred, CancellationToken _) =>
                    WorkflowMatrices.Where(pred.Compile()).ToList());
            wfRepo
                .Setup(r => r.FindAsync(It.IsAny<Expression<Func<WorkflowMatrix, bool>>>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((Expression<Func<WorkflowMatrix, bool>> pred, CancellationToken _) =>
                    WorkflowMatrices.FirstOrDefault(pred.Compile()));
            UnitOfWorkMock.Setup(u => u.WorkflowMatrixRepository).Returns(wfRepo.Object);

            // PositionRepository
            var posRepo = new Mock<IPositionRepository>();
            posRepo
                .Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((Guid id, CancellationToken _) => Positions.FirstOrDefault(p => p.Id == id));
            UnitOfWorkMock.Setup(u => u.PositionRepository).Returns(posRepo.Object);

            // PersonnelPositionRepository
            var ppRepo = new Mock<IPersonnelPositionRepository>();
            ppRepo
                .Setup(r => r.GetByPositionIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((Guid posId, CancellationToken _) =>
                    PersonnelPositions.Where(pp => pp.PositionId == posId).ToList());
            ppRepo
                .Setup(r => r.GetByUserIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((Guid userId, CancellationToken _) =>
                    PersonnelPositions.Where(pp => pp.UserId == userId).ToList());
            ppRepo
                .Setup(r => r.GetActiveByPositionTitleAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((string title, CancellationToken _) =>
                    PersonnelPositions.FirstOrDefault(pp =>
                        pp.IsActive &&
                        string.Equals(pp.Position?.Title, title, StringComparison.OrdinalIgnoreCase)));
            ppRepo
                .Setup(r => r.FindAsync(It.IsAny<Expression<Func<PersonnelPosition, bool>>>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((Expression<Func<PersonnelPosition, bool>> pred, CancellationToken _) =>
                    PersonnelPositions.FirstOrDefault(pred.Compile()));
            UnitOfWorkMock.Setup(u => u.PersonnelPositionRepository).Returns(ppRepo.Object);

            // UserRepository
            var userRepo = new Mock<IUserRepository>();
            userRepo
                .Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((Guid id, CancellationToken _) => Users.FirstOrDefault(u => u.Id == id));
            userRepo
                .Setup(r => r.GetByIdWithOfficeAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((Guid id, CancellationToken _) => Users.FirstOrDefault(u => u.Id == id));
            userRepo
                .Setup(r => r.FindAllAsync(It.IsAny<Expression<Func<User, bool>>>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((Expression<Func<User, bool>> pred, CancellationToken _) =>
                    Users.Where(pred.Compile()).ToList());
            UnitOfWorkMock.Setup(u => u.UserRepository).Returns(userRepo.Object);

            // BACMemberRepository
            var bacRepo = new Mock<IRepository<BACMember>>();
            bacRepo
                .Setup(r => r.FindAllAsync(It.IsAny<Expression<Func<BACMember, bool>>>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((Expression<Func<BACMember, bool>> pred, CancellationToken _) =>
                    BacMembers.Where(pred.Compile()).ToList());
            UnitOfWorkMock.Setup(u => u.BACMemberRepository).Returns(bacRepo.Object);

            // PMTMemberRepository
            var pmtMemberRepo = new Mock<IPMTMemberRepository>();
            pmtMemberRepo
                .Setup(r => r.FindAllAsync(It.IsAny<Expression<Func<PMTMember, bool>>>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((Expression<Func<PMTMember, bool>> pred, CancellationToken _) =>
                    PmtMembers.Where(pred.Compile()).ToList());
            UnitOfWorkMock.Setup(u => u.PMTMemberRepository).Returns(pmtMemberRepo.Object);

            // Organization & Office repositories
            var orgRepo = new Mock<IOrganizationRepository>();
            orgRepo
                .Setup(r => r.FindAsync(It.IsAny<Expression<Func<Organization, bool>>>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(Organization);
            UnitOfWorkMock.Setup(u => u.OrganizationRepository).Returns(orgRepo.Object);

            var officeRepo = new Mock<IOfficeRepository>();
            officeRepo
                .Setup(r => r.FindAsync(It.IsAny<Expression<Func<Office, bool>>>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(MainOffice);
            UnitOfWorkMock.Setup(u => u.OfficeRepository).Returns(officeRepo.Object);
        }
    }

    [Fact]
    public async Task ApprovalAndSignatorySeeder_ShouldSeedBacMembersWorkflowMatricesPositionsAndPmt()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase($"SignatorySeederTest_{Guid.NewGuid()}")
            .Options;

        await using var dbContext = new ApplicationDbContext(options);
        await OrganizationStructureSeeder.SeedAsync(dbContext);
        await ApprovalAndSignatorySeeder.SeedAsync(dbContext);

        // Run a second time to verify idempotency
        await ApprovalAndSignatorySeeder.SeedAsync(dbContext);

        var bacMembers = await dbContext.BACMembers!.OrderBy(b => b.Order).ToListAsync();
        bacMembers.Should().HaveCount(5);
        bacMembers.Should().Contain(b => b.Role == "Chairperson" && b.FullName.Contains("CARLOS M. REYES"));
        bacMembers.Should().Contain(b => b.Role == "ViceChairperson" && b.FullName.Contains("ELENA G. SANTOS"));
        bacMembers.Count(b => b.Role == "RegularMember").Should().Be(3);

        var matrices = await dbContext.WorkflowMatrices!.ToListAsync();
        matrices.Should().NotBeEmpty();

        var pmtMembers = await dbContext.PMTMembers!.ToListAsync();
        pmtMembers.Should().HaveCount(5);
        pmtMembers.Should().Contain(m => m.Role == nameof(PMTRoleEnum.Chair));
        pmtMembers.Should().Contain(m => m.Role == nameof(PMTRoleEnum.ViceChair));
    }

    [Fact]
    public async Task ApprovePPMPCommandHandler_ShouldResolveFinalApproverFromWorkflowMatrix_WhenActorNameNotProvided()
    {
        var fixture = new SignatoryTestFixture();
        var ppmp = new PPMP
        {
            Id = Guid.NewGuid(),
            PPMPNumber = "PPMP-2026-001",
            OfficeId = fixture.MainOfficeId,
            FiscalYearId = fixture.FiscalYearId,
            Status = StatusEnum.Submitted
        };

        var ppmpRepo = new Mock<IPPMPRepository>();
        ppmpRepo.Setup(r => r.GetByIdAsync(ppmp.Id, It.IsAny<CancellationToken>())).ReturnsAsync(ppmp);
        fixture.UnitOfWorkMock.Setup(u => u.PPMPRepository).Returns(ppmpRepo.Object);

        ApprovalEvent? capturedEvent = null;
        var approvalRepo = new Mock<IApprovalEventRepository>();
        approvalRepo
            .Setup(r => r.AddAsync(It.IsAny<ApprovalEvent>(), It.IsAny<CancellationToken>()))
            .Callback<ApprovalEvent, CancellationToken>((ev, _) => capturedEvent = ev)
            .Returns(Task.CompletedTask);
        fixture.UnitOfWorkMock.Setup(u => u.ApprovalEventRepository).Returns(approvalRepo.Object);

        var handler = new ApprovePPMPCommandHandler(fixture.UnitOfWorkMock.Object);
        var response = await handler.Handle(new ApprovePPMPCommand(ppmp.Id, null), CancellationToken.None);

        response.Succeeded.Should().BeTrue();
        ppmp.Status.Should().Be(StatusEnum.Approved);
        capturedEvent.Should().NotBeNull();
        capturedEvent!.Action.Should().Be("Approved");
        capturedEvent.ActorId.Should().Be(fixture.HopeUser.Id);
        capturedEvent.ActorName.Should().Be(fixture.HopeUser.FullName);
    }

    [Fact]
    public async Task ChangeAPRStatusCommandHandler_ShouldPopulateApprovedByFromWorkflowMatrix()
    {
        var fixture = new SignatoryTestFixture();
        var apr = new APR
        {
            Id = Guid.NewGuid(),
            APRNumber = "APR-2026-001",
            OfficeId = fixture.MainOfficeId,
            FiscalYearId = fixture.FiscalYearId,
            Status = StatusEnum.ForApproval
        };

        var aprRepo = new Mock<IAPRRepository>();
        aprRepo.Setup(r => r.GetByIdAsync(apr.Id, It.IsAny<CancellationToken>())).ReturnsAsync(apr);
        fixture.UnitOfWorkMock.Setup(u => u.APRRepository).Returns(aprRepo.Object);

        var handler = new ChangeAPRStatusCommandHandler(fixture.UnitOfWorkMock.Object);
        var result = await handler.Handle(
            new ChangeAPRStatusCommand
            {
                Id = apr.Id,
                Status = StatusEnum.Approved,
                Remarks = "Approved by HOPE"
            },
            CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        apr.Status.Should().Be(StatusEnum.Approved);
        apr.ApprovedBy.Should().Be(fixture.HopeUser.FullName);
    }

    [Fact]
    public async Task GeneratePpmpDocumentCommandHandler_ShouldGenerateRequiredApproversAndFinanceSignatory()
    {
        var fixture = new SignatoryTestFixture();
        var ppmp = new PPMP
        {
            Id = Guid.NewGuid(),
            PPMPNumber = "PPMP-2026-001",
            OfficeId = fixture.MainOfficeId,
            Office = fixture.MainOffice,
            FiscalYearId = fixture.FiscalYearId,
            FiscalYear = fixture.FiscalYear,
            PPMPType = PPMPTypeEnum.Original,
            Status = StatusEnum.Approved,
            ApprovalEvents =
            [
                new ApprovalEvent
                {
                    Id = Guid.NewGuid(),
                    Action = "Submitted",
                    ActorId = fixture.EndUser.Id,
                    ActorName = fixture.EndUser.FullName,
                    Role = "Department Chairperson",
                    Timestamp = DateTime.UtcNow.AddDays(-2)
                },
                new ApprovalEvent
                {
                    Id = Guid.NewGuid(),
                    Action = "Approved",
                    ActorId = fixture.HopeUser.Id,
                    ActorName = fixture.HopeUser.FullName,
                    Role = "Head of the Procuring Entity",
                    Timestamp = DateTime.UtcNow.AddDays(-1)
                }
            ]
        };

        var ppmpRepo = new Mock<IPPMPRepository>();
        ppmpRepo.Setup(r => r.GetPPMPWithDetailsAsync(ppmp.Id, It.IsAny<CancellationToken>())).ReturnsAsync(ppmp);
        fixture.UnitOfWorkMock.Setup(u => u.PPMPRepository).Returns(ppmpRepo.Object);

        PpmpDataDto? capturedDto = null;
        fixture.RendererMock
            .Setup(r => r.RenderAsync(It.IsAny<PpmpDataDto>(), DocumentType.Ppmp, ExportFormat.Pdf, It.IsAny<CancellationToken>()))
            .Callback<PpmpDataDto, DocumentType, ExportFormat, CancellationToken>((dto, _, _, _) => capturedDto = dto)
            .ReturnsAsync([1, 2, 3]);

        var handler = new GeneratePpmpDocumentCommandHandler(
            fixture.UnitOfWorkMock.Object,
            fixture.RendererMock.Object,
            fixture.StorageMock.Object);

        await handler.Handle(
            new GeneratePpmpDocumentCommand
            {
                PpmpId = ppmp.Id,
                Format = ExportFormat.Pdf,
                GeneratedBy = "tester"
            },
            CancellationToken.None);

        capturedDto.Should().NotBeNull();
        capturedDto!.Signatories.Should().HaveCount(3);
        capturedDto.Signatories.Should().Contain(s => s.Label == "Prepared by:" && s.PrintedName == fixture.EndUser.FullName);
        capturedDto.Signatories.Should().Contain(s => s.Label == "Funds Available:" && s.PrintedName == fixture.FinanceUser.FullName);
        capturedDto.Signatories.Should().Contain(s => s.Label == "Submitted by:" && s.PrintedName == fixture.HopeUser.FullName);
    }

    [Fact]
    public async Task GenerateLibAndWfpDocumentCommandHandlers_ShouldPopulateWorkflowAndFinanceSignatories()
    {
        var fixture = new SignatoryTestFixture();

        // 1. Test LIB Document Generation
        var lib = new LineItemBudget
        {
            Id = Guid.NewGuid(),
            LIBNumber = "LIB-2026-001",
            Name = "FY 2026 ICT Infrastructure LIB",
            Scope = "ActivityLevel",
            OfficeId = fixture.MainOfficeId,
            Office = fixture.MainOffice,
            FiscalYearId = fixture.FiscalYearId,
            FiscalYearEntity = fixture.FiscalYear,
            CreatedBy = fixture.EndUser.FullName
        };

        var libRepo = new Mock<ILineItemBudgetRepository>();
        libRepo.Setup(r => r.GetByIdWithDetailsAsync(lib.Id, It.IsAny<CancellationToken>())).ReturnsAsync(lib);
        fixture.UnitOfWorkMock.Setup(u => u.LineItemBudgetRepository).Returns(libRepo.Object);

        LibDataDto? capturedLibDto = null;
        fixture.RendererMock
            .Setup(r => r.RenderAsync(It.IsAny<LibDataDto>(), DocumentType.Lib, ExportFormat.Pdf, It.IsAny<CancellationToken>()))
            .Callback<LibDataDto, DocumentType, ExportFormat, CancellationToken>((dto, _, _, _) => capturedLibDto = dto)
            .ReturnsAsync([1, 2, 3]);

        var libHandler = new GenerateLibDocumentCommandHandler(
            fixture.UnitOfWorkMock.Object,
            fixture.RendererMock.Object,
            fixture.StorageMock.Object);

        await libHandler.Handle(
            new GenerateLibDocumentCommand
            {
                LibId = lib.Id,
                Format = ExportFormat.Pdf,
                GeneratedBy = "tester"
            },
            CancellationToken.None);

        capturedLibDto.Should().NotBeNull();
        capturedLibDto!.Signatories.Should().HaveCount(3);
        capturedLibDto.Signatories.Should().Contain(s => s.Label == "Prepared by:" && s.PrintedName == fixture.EndUser.FullName);
        capturedLibDto.Signatories.Should().Contain(s => s.Label == "Recommending Approval:" && s.PrintedName == fixture.RecommendingUser.FullName);
        capturedLibDto.Signatories.Should().Contain(s => s.Label == "Approved by:" && s.PrintedName == fixture.HopeUser.FullName);

        // 2. Test WFP Document Generation
        var wfp = new WFP
        {
            Id = Guid.NewGuid(),
            ProjectTitle = "FY 2026 Digital Transformation WFP",
            OfficeId = fixture.MainOfficeId,
            Office = fixture.MainOffice,
            ProjectStartDate = new DateOnly(2026, 1, 1),
            ProjectEndDate = new DateOnly(2026, 12, 31),
            CreatedBy = fixture.EndUser.FullName
        };

        var wfpRepo = new Mock<IWFPRepository>();
        wfpRepo.Setup(r => r.GetByIdWithDetailsAsync(wfp.Id, It.IsAny<CancellationToken>())).ReturnsAsync(wfp);
        wfpRepo.Setup(r => r.GetOrphanActivitiesAsync(wfp.Id, It.IsAny<CancellationToken>())).ReturnsAsync([]);
        fixture.UnitOfWorkMock.Setup(u => u.WFPRepository).Returns(wfpRepo.Object);

        WfpDataDto? capturedWfpDto = null;
        fixture.RendererMock
            .Setup(r => r.RenderAsync(It.IsAny<WfpDataDto>(), DocumentType.Wfp, ExportFormat.Pdf, It.IsAny<CancellationToken>()))
            .Callback<WfpDataDto, DocumentType, ExportFormat, CancellationToken>((dto, _, _, _) => capturedWfpDto = dto)
            .ReturnsAsync([1, 2, 3]);

        var wfpHandler = new GenerateWfpDocumentCommandHandler(
            fixture.UnitOfWorkMock.Object,
            fixture.RendererMock.Object,
            fixture.StorageMock.Object);

        await wfpHandler.Handle(
            new GenerateWfpDocumentCommand
            {
                WfpId = wfp.Id,
                Format = ExportFormat.Pdf,
                GeneratedBy = "tester"
            },
            CancellationToken.None);

        capturedWfpDto.Should().NotBeNull();
        capturedWfpDto!.Signatories.Should().HaveCount(3);
        capturedWfpDto.Signatories.Should().Contain(s => s.Label == "Prepared by:" && s.PrintedName == fixture.EndUser.FullName);
        capturedWfpDto.Signatories.Should().Contain(s => s.Label == "Recommending Approval:" && s.PrintedName == fixture.RecommendingUser.FullName);
        capturedWfpDto.Signatories.Should().Contain(s => s.Label == "Approved by:" && s.PrintedName == fixture.HopeUser.FullName);
    }

    [Fact]
    public async Task GenerateOpcrAndConsolidatedOpcrHandlers_ShouldPopulateWorkflowAndPmtSignatories()
    {
        var fixture = new SignatoryTestFixture();
        var opcr = new OPCR
        {
            Id = Guid.NewGuid(),
            Code = "OPCR-2026-CIT",
            OfficeId = fixture.MainOfficeId,
            Office = fixture.MainOffice,
            FiscalYearId = fixture.FiscalYearId,
            FiscalYear = fixture.FiscalYear
        };

        var opcrRepo = new Mock<IOPCRRepository>();
        opcrRepo.Setup(r => r.GetOPCRWithDetailsAsync(opcr.Id, It.IsAny<CancellationToken>())).ReturnsAsync(opcr);
        opcrRepo.Setup(r => r.GetOPCRWithRatingsAsync(opcr.Id, It.IsAny<CancellationToken>())).ReturnsAsync(opcr);
        fixture.UnitOfWorkMock.Setup(u => u.OPCRRepository).Returns(opcrRepo.Object);

        OpcrDataDto? capturedProposedDto = null;
        fixture.RendererMock
            .Setup(r => r.RenderAsync(It.IsAny<OpcrDataDto>(), DocumentType.Opcr, ExportFormat.Pdf, It.IsAny<CancellationToken>()))
            .Callback<OpcrDataDto, DocumentType, ExportFormat, CancellationToken>((dto, _, _, _) => capturedProposedDto = dto)
            .ReturnsAsync([1, 2, 3]);

        var proposedHandler = new GenerateProposedOpcrDocumentCommandHandler(
            fixture.UnitOfWorkMock.Object,
            fixture.RendererMock.Object,
            fixture.StorageMock.Object);

        await proposedHandler.Handle(
            new GenerateProposedOpcrDocumentCommand
            {
                OPCRId = opcr.Id,
                Format = ExportFormat.Pdf,
                GeneratedBy = "tester"
            },
            CancellationToken.None);

        capturedProposedDto.Should().NotBeNull();
        capturedProposedDto!.Signatories.Should().Contain(s => s.PrintedName == fixture.RecommendingUser.FullName);
        capturedProposedDto.Signatories.Should().Contain(s => s.PrintedName == fixture.HopeUser.FullName);

        // OPCR Rating Document
        OpcrDataDto? capturedRatingDto = null;
        fixture.RendererMock
            .Setup(r => r.RenderAsync(It.IsAny<OpcrDataDto>(), DocumentType.OpcrRating, ExportFormat.Pdf, It.IsAny<CancellationToken>()))
            .Callback<OpcrDataDto, DocumentType, ExportFormat, CancellationToken>((dto, _, _, _) => capturedRatingDto = dto)
            .ReturnsAsync([1, 2, 3]);

        var ratingHandler = new GenerateOpcrRatingDocumentCommandHandler(
            fixture.UnitOfWorkMock.Object,
            fixture.RendererMock.Object,
            fixture.StorageMock.Object);

        await ratingHandler.Handle(
            new GenerateOpcrRatingDocumentCommand
            {
                OPCRId = opcr.Id,
                Format = ExportFormat.Pdf,
                GeneratedBy = "tester"
            },
            CancellationToken.None);

        capturedRatingDto.Should().NotBeNull();
        capturedRatingDto!.Signatories.Should().Contain(s => s.Designation == "PMT Chairman" && s.PrintedName == fixture.RecommendingUser.FullName);
        capturedRatingDto.Signatories.Should().Contain(s => s.Designation == "PMT Co-Chairman" && s.PrintedName == fixture.FinanceUser.FullName);
        capturedRatingDto.Signatories.Should().Contain(s => s.Label == "Final Rating by:" && s.PrintedName == fixture.HopeUser.FullName);

        // Consolidated OPCR Document
        var consolidation = new OPCRConsolidation
        {
            Id = Guid.NewGuid(),
            Name = "FY2026-Consolidation",
            FiscalYearId = fixture.FiscalYearId,
            FiscalYear = fixture.FiscalYear,
            OPCRs = [opcr]
        };

        var consRepo = new Mock<IOPCRConsolidationRepository>();
        consRepo.Setup(r => r.GetConsolidationWithOPCRsAsync(consolidation.Id, It.IsAny<CancellationToken>())).ReturnsAsync(consolidation);
        fixture.UnitOfWorkMock.Setup(u => u.OPCRConsolidationRepository).Returns(consRepo.Object);

        ConsolidatedOpcrDataDto? capturedConsDto = null;
        fixture.RendererMock
            .Setup(r => r.RenderAsync(It.IsAny<ConsolidatedOpcrDataDto>(), DocumentType.ConsolidatedOpcr, ExportFormat.Pdf, It.IsAny<CancellationToken>()))
            .Callback<ConsolidatedOpcrDataDto, DocumentType, ExportFormat, CancellationToken>((dto, _, _, _) => capturedConsDto = dto)
            .ReturnsAsync([1, 2, 3]);

        var consHandler = new GenerateConsolidatedOpcrDocumentCommandHandler(
            fixture.UnitOfWorkMock.Object,
            fixture.RendererMock.Object,
            fixture.StorageMock.Object);

        await consHandler.Handle(
            new GenerateConsolidatedOpcrDocumentCommand
            {
                ConsolidationId = consolidation.Id,
                RatingPeriod = "FY 2026",
                Format = ExportFormat.Pdf,
                GeneratedBy = fixture.EndUser.FullName
            },
            CancellationToken.None);

        capturedConsDto.Should().NotBeNull();
        capturedConsDto!.Signatories.Should().HaveCount(3);
        capturedConsDto.Signatories.Should().Contain(s => s.Label == "Consolidated by:" && s.PrintedName == fixture.EndUser.FullName);
        capturedConsDto.Signatories.Should().Contain(s => s.Label == "Recommending Approval:" && s.PrintedName == fixture.RecommendingUser.FullName);
        capturedConsDto.Signatories.Should().Contain(s => s.Label == "Approved by:" && s.PrintedName == fixture.HopeUser.FullName);
    }

    [Fact]
    public async Task GenerateAppAndMarketScopingHandlers_ShouldPopulateBacChairAndHopeApprovers()
    {
        var fixture = new SignatoryTestFixture();

        // 1. APP Document Generation (with empty APPSignatories -> resolves from BACMemberRepository + WorkflowMatrix)
        var app = new APP
        {
            Id = Guid.NewGuid(),
            APPNumber = "APP-2026-001",
            FiscalYearId = fixture.FiscalYearId,
            FiscalYear = fixture.FiscalYear,
            APPSignatories = [],
            APPItems =
            [
                new APPItem
                {
                    Id = Guid.NewGuid(),
                    OfficeId = fixture.MainOfficeId,
                    Office = fixture.MainOffice
                }
            ]
        };

        var appRepo = new Mock<IAPPRepository>();
        appRepo.Setup(r => r.GetAPPWithDetailsAsync(app.Id, It.IsAny<CancellationToken>())).ReturnsAsync(app);
        fixture.UnitOfWorkMock.Setup(u => u.APPRepository).Returns(appRepo.Object);

        AppDataDto? capturedAppDto = null;
        fixture.RendererMock
            .Setup(r => r.RenderAsync(It.IsAny<AppDataDto>(), DocumentType.App, ExportFormat.Pdf, It.IsAny<CancellationToken>()))
            .Callback<AppDataDto, DocumentType, ExportFormat, CancellationToken>((dto, _, _, _) => capturedAppDto = dto)
            .ReturnsAsync([1, 2, 3]);

        var appHandler = new GenerateAppDocumentCommandHandler(
            fixture.UnitOfWorkMock.Object,
            fixture.RendererMock.Object,
            fixture.StorageMock.Object);

        await appHandler.Handle(
            new GenerateAppDocumentCommand
            {
                AppId = app.Id,
                Format = ExportFormat.Pdf,
                GeneratedBy = "tester"
            },
            CancellationToken.None);

        capturedAppDto.Should().NotBeNull();
        capturedAppDto!.Signatories.Should().Contain(s => s.Label == "Recommended by:" && s.PrintedName == "ENGR. CARLOS M. REYES, Ph.D.");
        capturedAppDto.Signatories.Should().Contain(s => s.Label == "Approved by:" && s.PrintedName == fixture.HopeUser.FullName);

        // 2. Market Scoping Document Generation
        var marketScoping = new MarketScoping
        {
            Id = Guid.NewGuid(),
            ProjectName = "Cloud Hosting Subscription",
            UserId = fixture.EndUser.Id
        };

        var msRepo = new Mock<IMarketScopingRepository>();
        msRepo.Setup(r => r.GetByIdWithDetailsAsync(marketScoping.Id, It.IsAny<CancellationToken>())).ReturnsAsync(marketScoping);
        fixture.UnitOfWorkMock.Setup(u => u.MarketScopingRepository).Returns(msRepo.Object);

        var msSettingsRepo = new Mock<IMarketScopingActivitySettingsRepository>();
        msSettingsRepo.Setup(r => r.Query(It.IsAny<Expression<Func<MarketScopingActivitySettings, bool>>>()))
            .Returns(Enumerable.Empty<MarketScopingActivitySettings>().AsQueryable());
        msSettingsRepo.Setup(r => r.ToListAsync(It.IsAny<IQueryable<MarketScopingActivitySettings>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);
        fixture.UnitOfWorkMock.Setup(u => u.MarketScopingActivitySettingsRepository).Returns(msSettingsRepo.Object);

        MarketScopingDataDto? capturedMsDto = null;
        fixture.RendererMock
            .Setup(r => r.RenderAsync(It.IsAny<MarketScopingDataDto>(), DocumentType.MarketScoping, ExportFormat.Pdf, It.IsAny<CancellationToken>()))
            .Callback<MarketScopingDataDto, DocumentType, ExportFormat, CancellationToken>((dto, _, _, _) => capturedMsDto = dto)
            .ReturnsAsync([1, 2, 3]);

        var msHandler = new GenerateMarketScopingDocumentCommandHandler(
            fixture.UnitOfWorkMock.Object,
            fixture.RendererMock.Object,
            fixture.StorageMock.Object);

        await msHandler.Handle(
            new GenerateMarketScopingDocumentCommand
            {
                MarketScopingId = marketScoping.Id,
                Format = ExportFormat.Pdf,
                GeneratedBy = "tester"
            },
            CancellationToken.None);

        capturedMsDto.Should().NotBeNull();
        capturedMsDto!.ApprovedBy.PrintedName.Should().Be(fixture.HopeUser.FullName);
    }

    [Fact]
    public async Task ProcurementDocumentSignatories_PO_AOB_PR_APR_ShouldResolveAllRequiredApproversAndCommitteeMembers()
    {
        var fixture = new SignatoryTestFixture();

        // 1. PurchaseOrderDataResolver
        var po = new PurchaseOrder
        {
            Id = Guid.NewGuid(),
            PONumber = "PO-2026-001",
            ProcurementMode = POProcurementModeEnum.SVP,
            SourceDocumentType = ERPEZ.Domain.Enums.SourceDocumentTypeEnum.AOB,
            SourceDocumentId = Guid.NewGuid(),
            ApprovedById = null, // Should fallback to WorkflowMatrix FinalApprover (HOPE)
            TotalAmount = 125000m
        };

        var poDto = await PurchaseOrderDataResolver.ResolveDataDtoAsync(po, fixture.UnitOfWorkMock.Object, CancellationToken.None);
        poDto.ApprovedByName.Should().Be(fixture.HopeUser.FullName);
        poDto.ApprovedByPosition.Should().Be(fixture.HopePosition.Title);

        // 2. AOBReferenceResolver (Approver, EndUserRep, TechRep)
        var cprId = Guid.NewGuid();
        var project = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            ConsolidatedPRId = cprId,
            APPItem = new APPItem
            {
                Id = Guid.NewGuid(),
                OfficeId = fixture.MainOfficeId,
                Office = fixture.MainOffice
            },
            Status = "Approved",
            EndUserRepresentativeId = fixture.EndUser.Id,
            EndUserRepresentative = fixture.EndUser,
            TechRepresentativeId = fixture.TechRepUser.Id,
            TechRepresentative = fixture.TechRepUser,
            BACResolutions =
            [
                new BACResolution
                {
                    Id = Guid.NewGuid(),
                    ResolutionNumber = "BAC-RES-2026-001",
                    Status = "Approved"
                }
            ]
        };

        var projRepo = new Mock<IProcurementProjectRepository>();
        projRepo.Setup(r => r.Query()).Returns(new List<ProcurementProject> { project }.AsQueryable());
        projRepo.Setup(r => r.FindAsync(It.IsAny<Expression<Func<ProcurementProject, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);
        fixture.UnitOfWorkMock.Setup(u => u.ProcurementProjectRepository).Returns(projRepo.Object);

        var rfq = new RFQ
        {
            Id = Guid.NewGuid(),
            RFQNumber = "RFQ-2026-001",
            ConsolidatedPRId = cprId
        };

        var aobMeta = await AOBReferenceResolver.ResolveAsync(
            fixture.UnitOfWorkMock.Object,
            Guid.NewGuid(),
            approvedBy: null,
            [rfq],
            CancellationToken.None);

        aobMeta.ApproverName.Should().Be(fixture.HopeUser.FullName);
        aobMeta.ApproverTitle.Should().Be(fixture.HopePosition.Title);
        aobMeta.EndUserRepName.Should().Be(fixture.EndUser.FullName);
        aobMeta.TechRepName.Should().Be(fixture.TechRepUser.FullName);

        // 3. Purchase Request Document Generation
        var pr = new PurchaseRequest
        {
            Id = Guid.NewGuid(),
            PRNumber = "PR-2026-001",
            OfficeId = fixture.MainOfficeId,
            Office = fixture.MainOffice,
            RequestedDate = DateOnly.FromDateTime(DateTime.UtcNow),
            TotalAmount = 50000m,
            ApprovalEvents =
            [
                new ApprovalEvent
                {
                    Id = Guid.NewGuid(),
                    Action = "Submitted",
                    ActorId = fixture.EndUser.Id,
                    ActorName = fixture.EndUser.FullName,
                    Role = fixture.EndUserPosition.Title,
                    Timestamp = DateTime.UtcNow
                }
            ]
        };

        var prRepo = new Mock<IPurchaseRequestRepository>();
        prRepo.Setup(r => r.GetPRWithDetailsAsync(pr.Id, It.IsAny<CancellationToken>())).ReturnsAsync(pr);
        fixture.UnitOfWorkMock.Setup(u => u.PurchaseRequestRepository).Returns(prRepo.Object);

        PurchaseRequestDataDto? capturedPrDto = null;
        fixture.RendererMock
            .Setup(r => r.RenderAsync(It.IsAny<PurchaseRequestDataDto>(), DocumentType.PurchaseRequest, ExportFormat.Pdf, It.IsAny<CancellationToken>()))
            .Callback<PurchaseRequestDataDto, DocumentType, ExportFormat, CancellationToken>((dto, _, _, _) => capturedPrDto = dto)
            .ReturnsAsync([1, 2, 3]);

        var prHandler = new GeneratePurchaseRequestDocumentCommandHandler(
            fixture.UnitOfWorkMock.Object,
            fixture.RendererMock.Object,
            fixture.StorageMock.Object);

        await prHandler.Handle(
            new GeneratePurchaseRequestDocumentCommand
            {
                PurchaseRequestId = pr.Id,
                Format = ExportFormat.Pdf,
                GeneratedBy = "tester"
            },
            CancellationToken.None);

        capturedPrDto.Should().NotBeNull();
        capturedPrDto!.Signatories.Should().HaveCount(4);
        capturedPrDto.Signatories.Should().Contain(s => s.Label == "Requested by:" && s.PrintedName == fixture.EndUser.FullName);
        capturedPrDto.Signatories.Should().Contain(s => s.Label == "Recommending Approval:" && s.PrintedName == fixture.RecommendingUser.FullName);
        capturedPrDto.Signatories.Should().Contain(s => s.Label == "Funds Available:" && s.PrintedName == fixture.FinanceUser.FullName);
        capturedPrDto.Signatories.Should().Contain(s => s.Label == "Approved by:" && s.PrintedName == fixture.HopeUser.FullName);

        // 4. APR Document Generation
        var apr = new APR
        {
            Id = Guid.NewGuid(),
            APRNumber = "APR-2026-001",
            OfficeId = fixture.MainOfficeId,
            Office = fixture.MainOffice,
            FiscalYearId = fixture.FiscalYearId,
            FiscalYear = fixture.FiscalYear,
            TotalAmount = 75000m
        };

        var aprRepo = new Mock<IAPRRepository>();
        aprRepo.Setup(r => r.GetAPRWithDetailsAsync(apr.Id, It.IsAny<CancellationToken>())).ReturnsAsync(apr);
        fixture.UnitOfWorkMock.Setup(u => u.APRRepository).Returns(aprRepo.Object);

        AprDataDto? capturedAprDto = null;
        fixture.RendererMock
            .Setup(r => r.RenderAsync(It.IsAny<AprDataDto>(), DocumentType.Apr, ExportFormat.Pdf, It.IsAny<CancellationToken>()))
            .Callback<AprDataDto, DocumentType, ExportFormat, CancellationToken>((dto, _, _, _) => capturedAprDto = dto)
            .ReturnsAsync([1, 2, 3]);

        var aprHandler = new GenerateAprDocumentCommandHandler(
            fixture.UnitOfWorkMock.Object,
            fixture.RendererMock.Object,
            fixture.StorageMock.Object);

        await aprHandler.Handle(
            new GenerateAprDocumentCommand
            {
                APRId = apr.Id,
                Format = ExportFormat.Pdf,
                GeneratedBy = "tester"
            },
            CancellationToken.None);

        capturedAprDto.Should().NotBeNull();
        capturedAprDto!.PropertyOfficer.PrintedName.Should().Be(fixture.SupplyUser.FullName);
        capturedAprDto.ChiefAccountant.PrintedName.Should().Be(fixture.FinanceUser.FullName);
        capturedAprDto.ApprovedBy.PrintedName.Should().Be(fixture.HopeUser.FullName);
    }
}
