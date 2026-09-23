using System;
using System.Collections.Generic;

namespace ERPEZ.Application.Common.Helpers;

public static class PhilippineCurrencyWordsHelper
{
    private static readonly string[] ones =
    [
        "", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE",
        "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN",
        "SEVENTEEN", "EIGHTEEN", "NINETEEN"
    ];

    private static readonly string[] tens =
    [
        "", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"
    ];

    private static readonly string[] scales = ["", "THOUSAND", "MILLION", "BILLION", "TRILLION"];

    private static string ConvertChunk(long num)
    {
        var result = "";
        var hundreds = num / 100;
        var remainder = num % 100;

        if (hundreds > 0)
        {
            result += $"{ones[hundreds]} HUNDRED ";
        }

        if (remainder > 0)
        {
            if (remainder < 20)
            {
                result += ones[remainder];
            }
            else
            {
                var ten = remainder / 10;
                var one = remainder % 10;
                result += tens[ten];
                if (one > 0)
                {
                    result += $"-{ones[one]}";
                }
            }
        }

        return result.Trim();
    }

    public static string ToPhilippinePesoWords(decimal amount)
    {
        if (amount == 0)
        {
            return "ZERO PESOS AND 00/100 (Php 0.00) ONLY";
        }

        var absoluteAmount = Math.Abs(amount);
        var integerPart = (long)Math.Truncate(absoluteAmount);
        var cents = (int)Math.Round((absoluteAmount - integerPart) * 100);

        string words;
        if (integerPart == 0)
        {
            words = "ZERO";
        }
        else
        {
            var currentNumber = integerPart;
            var scaleIndex = 0;
            var parts = new List<string>();

            while (currentNumber > 0)
            {
                var chunk = currentNumber % 1000;
                if (chunk > 0)
                {
                    var chunkWords = ConvertChunk(chunk);
                    var scale = scales[scaleIndex];
                    parts.Insert(0, string.IsNullOrEmpty(scale) ? chunkWords : $"{chunkWords} {scale}");
                }
                currentNumber /= 1000;
                scaleIndex++;
            }

            words = string.Join(" ", parts);
        }

        var formattedFigures = $"Php {absoluteAmount:N2}";
        var currencyUnit = integerPart == 1 ? "PESO" : "PESOS";
        return $"{words} {currencyUnit} AND {cents:D2}/100 ({formattedFigures}) ONLY";
    }
}
