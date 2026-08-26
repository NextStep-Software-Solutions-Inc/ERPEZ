namespace ERPEZ.Shared.Common;

/// <summary>
/// Comprehensive PostgreSQL SQLSTATE error code mappings.
/// Based on PostgreSQL documentation: https://www.postgresql.org/docs/current/errcodes-appendix.html
/// </summary>
public static class PostgresErrorCodes
{
    /// <summary>
    /// Dictionary containing all PostgreSQL SQLSTATE error codes and their user-friendly descriptions.
    /// </summary>
    public static readonly Dictionary<string, string> errorMessages = new()
    {
        // Class 00: Successful Completion
        ["00000"] = "Operation completed successfully.",

        // Class 01: Warning
        ["01000"] = "General warning.",
        ["0100C"] = "Dynamic result sets returned.",
        ["01008"] = "Implicit zero bit padding.",
        ["01003"] = "Null value eliminated in set function.",
        ["01007"] = "Privilege not granted.",
        ["01006"] = "Privilege not revoked.",
        ["01004"] = "String data, right truncation.",
        ["01P01"] = "Deprecated feature.",

        // Class 02: No Data (this is also a warning class per SQL standard)
        ["02000"] = "No data found.",
        ["02001"] = "No additional dynamic result sets returned.",

        // Class 03: SQL Statement Not Yet Complete
        ["03000"] = "SQL statement not yet complete.",

        // Class 08: Connection Exception
        ["08000"] = "Connection exception.",
        ["08003"] = "Connection does not exist.",
        ["08006"] = "Connection failure.",
        ["08001"] = "SQL client unable to establish SQL connection.",
        ["08004"] = "SQL server rejected establishment of SQL connection.",
        ["08007"] = "Transaction resolution unknown.",
        ["08P01"] = "Protocol violation.",

        // Class 09: Triggered Action Exception
        ["09000"] = "Triggered action exception.",

        // Class 0A: Feature Not Supported
        ["0A000"] = "Feature not supported.",

        // Class 0B: Invalid Transaction Initiation
        ["0B000"] = "Invalid transaction initiation.",

        // Class 0F: Locator Exception
        ["0F000"] = "Locator exception.",
        ["0F001"] = "Invalid locator specification.",

        // Class 0L: Invalid Grantor
        ["0L000"] = "Invalid grantor.",
        ["0LP01"] = "Invalid grant operation.",

        // Class 0P: Invalid Role Specification
        ["0P000"] = "Invalid role specification.",

        // Class 0Z: Diagnostics Exception
        ["0Z000"] = "Diagnostics exception.",
        ["0Z002"] = "Stacked diagnostics accessed without active handler.",

        // Class 20: Case Not Found
        ["20000"] = "Case not found.",

        // Class 21: Cardinality Violation
        ["21000"] = "Cardinality violation.",

        // Class 22: Data Exception
        ["22000"] = "Data exception.",
        ["2202E"] = "Array subscript error.",
        ["22021"] = "Character not in repertoire.",
        ["22008"] = "Datetime field overflow.",
        ["22012"] = "Division by zero.",
        ["22005"] = "Error in assignment.",
        ["2200B"] = "Escape character conflict.",
        ["22022"] = "Indicator overflow.",
        ["22015"] = "Interval field overflow.",
        ["2201E"] = "Invalid argument for logarithm.",
        ["22014"] = "Invalid argument for nth_value function.",
        ["22016"] = "Invalid argument for ntile function.",
        ["2201F"] = "Invalid argument for power function.",
        ["2201G"] = "Invalid argument for width_bucket function.",
        ["22018"] = "Invalid character value for cast.",
        ["22007"] = "Invalid datetime format.",
        ["22019"] = "Invalid escape character.",
        ["2200D"] = "Invalid escape octet.",
        ["22025"] = "Invalid escape sequence.",
        ["22010"] = "Invalid indicator parameter value.",
        ["22023"] = "Invalid parameter value.",
        ["2201B"] = "Invalid regular expression.",
        ["2201W"] = "Invalid row count in limit clause.",
        ["2201X"] = "Invalid row count in result offset clause.",
        ["22009"] = "Invalid time zone displacement value.",
        ["2200C"] = "Invalid use of escape character.",
        ["2200G"] = "Most specific type mismatch.",
        ["22004"] = "Null value not allowed.",
        ["22002"] = "Null value, no indicator parameter.",
        ["22003"] = "Numeric value out of range.",
        ["22026"] = "String data, length mismatch.",
        ["22001"] = "String data, right truncation.",
        ["22011"] = "Substring error.",
        ["22027"] = "Trim error.",
        ["22024"] = "Unterminated C string.",
        ["2200F"] = "Zero length character string.",
        ["22P01"] = "Floating-point exception.",
        ["22P02"] = "Invalid text representation.",
        ["22P03"] = "Invalid binary representation.",
        ["22P04"] = "Bad copy file format.",
        ["22P05"] = "Untranslatable character.",
        ["22P06"] = "Nonstandard use of escape character.",

        // Class 23: Integrity Constraint Violation
        ["23000"] = "Integrity constraint violation.",
        ["23001"] = "Restrict violation.",
        ["23502"] = "Not null violation.",
        ["23503"] = "Foreign key violation.",
        ["23505"] = "Unique violation.",
        ["23514"] = "Check violation.",
        ["23P01"] = "Exclusion violation.",

        // Class 24: Invalid Cursor State
        ["24000"] = "Invalid cursor state.",

        // Class 25: Invalid Transaction State
        ["25000"] = "Invalid transaction state.",
        ["25001"] = "Active SQL transaction.",
        ["25002"] = "Branch transaction already active.",
        ["25008"] = "Held cursor requires same isolation level.",
        ["25003"] = "Inappropriate access mode for branch transaction.",
        ["25004"] = "Inappropriate isolation level for branch transaction.",
        ["25005"] = "No active SQL transaction for branch transaction.",
        ["25006"] = "Read-only SQL transaction.",
        ["25007"] = "Schema and data statement mixing not supported.",
        ["25P01"] = "No active SQL transaction.",
        ["25P02"] = "In failed SQL transaction.",
        ["25P03"] = "Idle in transaction session timeout.",

        // Class 26: Invalid SQL Statement Name
        ["26000"] = "Invalid SQL statement name.",

        // Class 27: Triggered Data Change Violation
        ["27000"] = "Triggered data change violation.",

        // Class 28: Invalid Authorization Specification
        ["28000"] = "Invalid authorization specification.",
        ["28P01"] = "Invalid password.",

        // Class 2B: Dependent Privilege Descriptors Still Exist
        ["2B000"] = "Dependent privilege descriptors still exist.",
        ["2BP01"] = "Dependent objects still exist.",

        // Class 2D: Invalid Transaction Termination
        ["2D000"] = "Invalid transaction termination.",

        // Class 2F: SQL Routine Exception
        ["2F000"] = "SQL routine exception.",
        ["2F005"] = "Function executed no return statement.",
        ["2F002"] = "Modifying SQL data not permitted.",
        ["2F003"] = "Prohibited SQL statement attempted.",
        ["2F004"] = "Reading SQL data not permitted.",

        // Class 34: Invalid Cursor Name
        ["34000"] = "Invalid cursor name.",

        // Class 38: External Routine Exception
        ["38000"] = "External routine exception.",
        ["38001"] = "Containing SQL not permitted.",
        ["38002"] = "Modifying SQL data not permitted.",
        ["38003"] = "Prohibited SQL statement attempted.",
        ["38004"] = "Reading SQL data not permitted.",

        // Class 39: External Routine Invocation Exception
        ["39000"] = "External routine invocation exception.",
        ["39001"] = "Invalid SQLSTATE returned.",
        ["39004"] = "Null value not allowed.",
        ["39P01"] = "Trigger protocol violated.",
        ["39P02"] = "SRF protocol violated.",
        ["39P03"] = "Event trigger protocol violated.",

        // Class 3B: Savepoint Exception
        ["3B000"] = "Savepoint exception.",
        ["3B001"] = "Invalid savepoint specification.",

        // Class 3D: Invalid Catalog Name
        ["3D000"] = "Invalid catalog name.",

        // Class 3F: Invalid Schema Name
        ["3F000"] = "Invalid schema name.",

        // Class 40: Transaction Rollback
        ["40000"] = "Transaction rollback.",
        ["40002"] = "Transaction integrity constraint violation.",
        ["40001"] = "Serialization failure.",
        ["40003"] = "Statement completion unknown.",
        ["40P01"] = "Deadlock detected.",

        // Class 42: Syntax Error or Access Rule Violation
        ["42000"] = "Syntax error or access rule violation.",
        ["42601"] = "Syntax error.",
        ["42501"] = "Insufficient privilege.",
        ["42846"] = "Cannot coerce.",
        ["42803"] = "Grouping error.",
        ["42P20"] = "Windowing error.",
        ["42P19"] = "Invalid recursion.",
        ["42830"] = "Invalid foreign key.",
        ["42602"] = "Invalid name.",
        ["42622"] = "Name too long.",
        ["42939"] = "Reserved name.",
        ["42804"] = "Datatype mismatch.",
        ["42P18"] = "Indeterminate datatype.",
        ["42P21"] = "Collation mismatch.",
        ["42P22"] = "Indeterminate collation.",
        ["42809"] = "Wrong object type.",
        ["428C9"] = "Generated always.",
        ["42703"] = "Undefined column.",
        ["42883"] = "Undefined function.",
        ["42P01"] = "Undefined table.",
        ["42P02"] = "Undefined parameter.",
        ["42704"] = "Undefined object.",
        ["42701"] = "Duplicate column.",
        ["42P03"] = "Duplicate cursor.",
        ["42P04"] = "Duplicate database.",
        ["42723"] = "Duplicate function.",
        ["42P05"] = "Duplicate prepared statement.",
        ["42P06"] = "Duplicate schema.",
        ["42P07"] = "Duplicate table.",
        ["42712"] = "Duplicate alias.",
        ["42710"] = "Duplicate object.",
        ["42702"] = "Ambiguous column.",
        ["42725"] = "Ambiguous function.",
        ["42P08"] = "Ambiguous parameter.",
        ["42P09"] = "Ambiguous alias.",
        ["42P10"] = "Invalid column reference.",
        ["42611"] = "Invalid column definition.",
        ["42P11"] = "Invalid cursor definition.",
        ["42P12"] = "Invalid database definition.",
        ["42P13"] = "Invalid function definition.",
        ["42P14"] = "Invalid prepared statement definition.",
        ["42P15"] = "Invalid schema definition.",
        ["42P16"] = "Invalid table definition.",
        ["42P17"] = "Invalid object definition.",

        // Class 44: WITH CHECK OPTION Violation
        ["44000"] = "WITH CHECK OPTION violation.",

        // Class 53: Insufficient Resources
        ["53000"] = "Insufficient resources.",
        ["53100"] = "Disk full.",
        ["53200"] = "Out of memory.",
        ["53300"] = "Too many connections.",
        ["53400"] = "Configuration limit exceeded.",

        // Class 54: Program Limit Exceeded
        ["54000"] = "Program limit exceeded.",
        ["54001"] = "Statement too complex.",
        ["54011"] = "Too many columns.",
        ["54023"] = "Too many arguments.",

        // Class 55: Object Not In Prerequisite State
        ["55000"] = "Object not in prerequisite state.",
        ["55006"] = "Object in use.",
        ["55P02"] = "Cant change runtime param.",
        ["55P03"] = "Lock not available.",

        // Class 57: Operator Intervention
        ["57000"] = "Operator intervention.",
        ["57014"] = "Query canceled.",
        ["57P01"] = "Admin shutdown.",
        ["57P02"] = "Crash shutdown.",
        ["57P03"] = "Cannot connect now.",
        ["57P04"] = "Database dropped.",
        ["57P05"] = "Idle session timeout.",

        // Class 58: System Error (errors external to PostgreSQL itself)
        ["58000"] = "System error.",
        ["58030"] = "IO error.",
        ["58P01"] = "Undefined file.",
        ["58P02"] = "Duplicate file.",

        // Class 72: Snapshot Failure
        ["72000"] = "Snapshot too old.",

        // Class F0: Configuration File Error
        ["F0000"] = "Config file error.",
        ["F0001"] = "Lock file exists.",

        // Class HV: Foreign Data Wrapper Error (SQL/MED)
        ["HV000"] = "FDW error.",
        ["HV005"] = "FDW column name not found.",
        ["HV002"] = "FDW dynamic parameter value needed.",
        ["HV010"] = "FDW function sequence error.",
        ["HV021"] = "FDW inconsistent descriptor information.",
        ["HV024"] = "FDW invalid attribute value.",
        ["HV007"] = "FDW invalid column name.",
        ["HV008"] = "FDW invalid column number.",
        ["HV004"] = "FDW invalid data type.",
        ["HV006"] = "FDW invalid data type descriptors.",
        ["HV091"] = "FDW invalid descriptor field identifier.",
        ["HV00B"] = "FDW invalid handle.",
        ["HV00C"] = "FDW invalid option index.",
        ["HV00D"] = "FDW invalid option name.",
        ["HV090"] = "FDW invalid string length or buffer length.",
        ["HV00A"] = "FDW invalid string format.",
        ["HV009"] = "FDW invalid use of null pointer.",
        ["HV014"] = "FDW too many handles.",
        ["HV001"] = "FDW out of memory.",
        ["HV00P"] = "FDW no schemas.",
        ["HV00J"] = "FDW option name not found.",
        ["HV00K"] = "FDW reply handle.",
        ["HV00Q"] = "FDW schema not found.",
        ["HV00R"] = "FDW table not found.",
        ["HV00L"] = "FDW unable to create execution.",
        ["HV00M"] = "FDW unable to create reply.",
        ["HV00N"] = "FDW unable to establish connection.",

        // Class P0: PL/pgSQL Error
        ["P0000"] = "PL/pgSQL error.",
        ["P0001"] = "Raise exception.",
        ["P0002"] = "No data found.",
        ["P0003"] = "Too many rows.",
        ["P0004"] = "Assert failure.",

        // Class XX: Internal Error
        ["XX000"] = "Internal error.",
        ["XX001"] = "Data corrupted.",
        ["XX002"] = "Index corrupted."
    };

    /// <summary>
    /// Gets a user-friendly error message for a PostgreSQL SQLSTATE code.
    /// </summary>
    /// <param name="sqlState">The 5-character SQLSTATE code.</param>
    /// <returns>A tuple containing the friendly message and a boolean indicating if the code was found.</returns>
    public static (string Message, bool Found) GetErrorMessage(string sqlState)
    {
        if (errorMessages.TryGetValue(sqlState, out var message))
        {
            return ($"{message} (SQLSTATE: {sqlState})", true);
        }

        return ($"Database error occurred (SQLSTATE: {sqlState})", false);
    }
}