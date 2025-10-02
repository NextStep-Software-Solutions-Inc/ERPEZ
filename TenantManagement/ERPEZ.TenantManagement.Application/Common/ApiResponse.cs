namespace ERPEZ.TenantManagement.Application.Common;

public class ApiResponse<T>
{
    public bool Succeeded { get; set; }

    public string? Message { get; set; }

    public T? Data { get; set; }

    public static ApiResponse<TEntity> Success<TEntity>(TEntity data, string? message = null)
    {
        return new ApiResponse<TEntity> { Succeeded = true, Data = data, Message = message };
    }

    public static ApiResponse<T> Fail(string message)
    {
        // When failing, Data will correctly be null by default.
        return new ApiResponse<T> { Succeeded = false, Message = message };
    }
}