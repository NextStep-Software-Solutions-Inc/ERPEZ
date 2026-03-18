1. The Registry Layer (Task 1 & 2)
These are your "Blueprints." They contain no specific targets or dates.
Entity: KPI
Id (UUID, PK)
ParentKPIId (UUID, FK, Nullable) — For the D1/Sub-KPI hierarchy.
MFOPAPIId (UUID, FK) — Links to the Agency Mandate.
Name (string)
Code (string)
Description (string)
MeasurementUnit (Enum: Number, Percentage, Currency)
DistributionBehavior (Enum: Divisible, Uniform, Milestone)
FunctionCategory (Enum: Strategic, Core, Support)
MonitoringFrequency (Enum: Quarterly, Semi-Annual, Annual)(Optional)
IsOptInAvailable (bool)
IsGAD (bool)
Status (Active or Inactive)
MeasurementUnit (Enum: (Number/Count, Percentage (%), Currency) — Dictates UI formatting and validation.
Entity: KPIMeasurement
Id (UUID, PK)
KPIId (UUID, FK)
Dimension (Enum: Quantity, Quality, Timeliness)
RatingTemplateId (UUID, FK) — Links to Task 2 Rating Templates.
MOVs (array of strings)
IsMOVEditable (Boolean)
IsScaleEditable (Boolean)
Tagging Entities (Compliance & Categorization):
SDG: Id (Int), Name, Description, Code (String).
KPISDG: Id (Int), KPIId (FK), SDGId (FK).
Attribute: Id (UUID), Name, Code, Description, ParentAttributeId (FK). — Handles PREXC, KRA, SUC Leveling, etc.
KPIAttribute: Id (UUID), KPIId (FK), AttributeId (FK).
Rating Entities (Scoring Logic):
Entity: RatingScaleTemplate: 
Id (UUID)
Name (string)
Description (string)
IsFixed (Bool)
IsDefault (Bool)
GeneralRatingScaleId (UUID?)
Entity: RatingScaleLevel: 
Id (UUID)
RatingScaleTemplateId (UUID FK)
RatingValue (Int 1-5)
Description (String)
MinValue (Decimal)
MaxValue (Decimal).

2. The Annual Snapshot Layer (Task 3.1)
When a KPI is "Activated," all metadata is cloned to prevent future master edits from altering current year commitments.
Entity: FYActiveKPI
Id (UUID, PK)
FiscalYearId (UUID, FK)
MasterKPIId (UUID, FK) — Lineage link.
Snapshotted Metadata — Full copy of Name, Unit, Behavior, etc.
ParentKPIId (UUID, FK, Nullable) — For the D1/Sub-KPI hierarchy.
MFOPAPIId (UUID, FK) — Links to the Agency Mandate.
Name (string)
Code (string)
Description (string)
MeasurementUnit (Enum: Number, Percentage, Currency)
DistributionBehavior (Enum: Divisible, Uniform, Milestone)
FunctionCategory (Enum: Strategic, Core, Support)
MonitoringFrequency (Enum: Quarterly, Semi-Annual, Annual)(Optional)
IsOptInAvailable (bool)
IsGAD (bool)
Status (Active or Inactive)
AgencyTargetAnnual (Decimal) — Level 1 (Agency) Target.
AgencyTargetQ1 (Decimal, Nullable) — Optional Agency Phasing.
AgencyTargetQ2 (Decimal, Nullable)
AgencyTargetQ3 (Decimal, Nullable)
AgencyTargetQ4 (Decimal, Nullable)
Entity: FYActiveKPIMeasurement
Id (UUID, PK)
FYActiveKPIId (UUID, FK)
Snapshotted Dimension Data — Full copy of Dimension, TemplateID, and MOV.
Dimension (Enum: Quantity, Quality, Timeliness)
RatingTemplateId (UUID, FK) — Links to Task 2 Rating Templates.
MOVs (array of strings)
IsMOVEditable (Boolean)
IsScaleEditable (Boolean)

3. The Assignment Layer (Task 3.2)
This is the "Level 2" accordion where Planning distributes targets to Offices.
Entity: KPIAssignment
Id (UUID, PK)
FYActiveKPIId (UUID, FK)
OfficeId (UUID, FK)
AssignedTargetAnnual (Decimal) — Level 2 Target.
AssignedTargetQ1, Q2, Q3, Q4 (Decimal, Nullable) — If these fields are NULL, Office proposes in Layer 3.
IsLocked (Boolean) — If True, Office cannot change the value. If False, it's a "Proposal."

👨‍🏫 Final Summary of Logic for your Developers
Feature
Backend Rule (Junior Developer)
Activation
Use a Transaction to copy KPI and KPIMeasurement into the FYActive tables simultaneously. Once created, the FYActiveKPI record should no longer reference the Master table for logic—only for reporting
Quarterly Logic
Quarters in KPIAssignment are Optional. If Planning leaves them blank, the Office gets to propose their timeline in the next module.


Definition of Done for the Database Architect
The Master Library is protected from accidental edits.
The Planning Office can set targets at the Agency level first.
The Cascading Engine ensures the mathematical sum is correct for every office.
The Offices retain the freedom to propose their quarterly timeline if Planning allows it.
🏛️ Master Registry Layer (Tasks 1 & 2)
These APIs manage the "Blueprints" or templates of your KPIs. They contain no year-specific data.
KPI CRUD Logic
POST /kpis: Create a new master record.
Validation: Ensure the Code is unique.
Hierarchy: If ParentKPIId is provided, verify the parent exists to maintain the D1/Sub-KPI structure.
PUT/PATCH /kpis/:id: Update metadata.
Rule: Changes here must not affect existing FYActiveKPI records from previous years.
GET /kpis: Return all master KPIs.
UI Requirement: Support tree-view filtering (Group by ParentKPIId).
KPIMeasurement CRUD Logic
POST /kpi-measurements: Define a dimension (Quantity, Quality, Timeliness) for a Master KPI.
Validation: A Master KPI can have multiple measurements, but only one per unique Dimension per KPI.

📅 Annual Snapshot Layer (Task 3.1)
This layer "freezes" the master definitions into a specific fiscal year.
Activation Logic (The "Clone" Service)
POST /fy-active-kpis/activate:
Logic: Must use a Database Transaction.
Process:
Copy metadata from KPI to FYActiveKPI.
Copy all related KPIMeasurement rows to FYActiveKPIMeasurement.
Result: The Planning Office can now set the AgencyTargetAnnual and optional quarterly phasing.

📉 The Target Cascading Engine (Task 3.2)
This is where the mathematical behavior logic is enforced when Planning distributes targets to Offices.
Behavior Logic Enforcement
When performing a POST or PUT on KPIAssignment, the backend must validate based on the DistributionBehavior of the parent FYActiveKPI.
Target Behavior Logic (Task 3.2)
The backend must enforce the following rules when saving KPIAssignment rows:
Summative (Divisible): SUM(KPIAssignment.AssignedTargetAnnual) must exactly equal FYActiveKPI.AgencyTargetAnnual.
Average (Uniform): Every KPIAssignment.AssignedTargetAnnual is automatically forced to match the AgencyTargetAnnual.
Milestone: Typically enforces a quantity of "1" or a binary pass/fail state.
The validation logic for MeasurementUnit == PERCENTAGE is now adjusted as follows:
General Rule: Remove the hard cap of 100 for all percentage units.
Average (Uniform) Logic: The system enforces that the AssignedTargetAnnual for every office matches the AgencyTargetAnnual exactly, regardless of whether the value is 80% or 120%.
Summative (Divisible) Logic: The system still enforces that the summation of office targets == Agency Target. If the Agency goal is 50% (e.g., a total growth target), the sum of the offices must equal 200%
Quarterly Logic & Proposals
Flexible Hand-off: If AssignedTargetQ1...Q4 are left NULL by Planning in the KPIAssignment entity, the system identifies this as an "Open Proposal".
Hand-off: If Planning leaves quarterly targets blank, the Office retains the freedom to propose their own timeline in the next module.
Validation: If quarterly targets are provided, the system validates that they align with the annual total
Locking: If IsLocked is true, the Office cannot modify the assigned values in Layer 3.

✅ Definition of Done for Developers
Immutability: Ensure the Master Library is protected; edits there do not alter snapshots.
Sequential Workflow: Ensure FYActiveKPI (Agency Target) is set before KPIAssignment (Office Targets).
Math Integrity: The Cascading Engine must reject any "Divisible" save that does not balance perfectly.
Office Autonomy: The system must allow NULL quarters in assignments so Offices can propose their own timelines later.

