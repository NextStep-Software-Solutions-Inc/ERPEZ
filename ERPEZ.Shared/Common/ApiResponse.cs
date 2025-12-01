namespace ERPEZ.Shared.Common;
using Errors = IDictionary<string, string[]>;

public class ApiResponse<T>
{
    public bool Succeeded { get; set; }

    public string? Message { get; set; }

    public T? Data { get; set; }

    public Errors? Errors { get; set; }


    public static ApiResponse<T> Success(T data, string? message = null)
    {
        return new ApiResponse<T> { Succeeded = true, Data = data, Message = message };
    }

    public static ApiResponse<T> Fail(string message)
    {
        return new ApiResponse<T> { Succeeded = false, Message = message };
    }

    public static ApiResponse<T> Fail(Errors errors, string message)
    {
        return new ApiResponse<T> { Succeeded = false, Errors = errors, Message = message };
    }
}
