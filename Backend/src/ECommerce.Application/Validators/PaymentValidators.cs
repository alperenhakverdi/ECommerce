using FluentValidation;
using ECommerce.Application.DTOs.Payment;

namespace ECommerce.Application.Validators;

public class PaymentRequestValidator : AbstractValidator<PaymentRequest>
{
    public PaymentRequestValidator()
    {
        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Payment amount must be greater than 0")
            .LessThanOrEqualTo(50000).WithMessage("Payment amount cannot exceed $50,000");

        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Currency is required")
            .Length(3).WithMessage("Currency must be 3 characters (ISO 4217)")
            .Must(BeValidCurrency).WithMessage("Invalid currency code");

        RuleFor(x => x.OrderId)
            .NotEmpty().WithMessage("Order ID is required")
            .Must(BeValidGuid).WithMessage("Order ID must be a valid GUID");

        RuleFor(x => x.CustomerEmail)
            .NotEmpty().WithMessage("Customer email is required")
            .EmailAddress().WithMessage("Please provide a valid email address");

        RuleFor(x => x.PaymentMethod)
            .NotNull().WithMessage("Payment method is required")
            .SetValidator(new PaymentMethodValidator());

        RuleFor(x => x.BillingAddress)
            .SetValidator(new BillingAddressValidator()!)
            .When(x => x.BillingAddress != null);
    }

    private bool BeValidCurrency(string currency)
    {
        var validCurrencies = new[] { "USD", "EUR", "GBP", "TRY", "CAD", "AUD" };
        return validCurrencies.Contains(currency.ToUpperInvariant());
    }

    private bool BeValidGuid(string orderId)
    {
        return Guid.TryParse(orderId, out _);
    }
}

public class PaymentMethodValidator : AbstractValidator<PaymentMethod>
{
    public PaymentMethodValidator()
    {
        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Please select a valid payment method type");

        When(x => x.Type == PaymentType.CreditCard || x.Type == PaymentType.DebitCard, () =>
        {
            RuleFor(x => x.CreditCard)
                .NotNull().WithMessage("Credit card details are required")
                .SetValidator(new CreditCardValidator()!);
        });

        When(x => x.Type == PaymentType.PayPal, () =>
        {
            RuleFor(x => x.PayPal)
                .NotNull().WithMessage("PayPal details are required")
                .SetValidator(new PayPalValidator()!);
        });

        When(x => x.Type == PaymentType.BankTransfer, () =>
        {
            RuleFor(x => x.BankTransfer)
                .NotNull().WithMessage("Bank transfer details are required")
                .SetValidator(new BankTransferValidator()!);
        });
    }
}

public class CreditCardValidator : AbstractValidator<CreditCardDetails>
{
    public CreditCardValidator()
    {
        RuleFor(x => x.CardNumber)
            .NotEmpty().WithMessage("Card number is required")
            .Matches("^[0-9]{13,19}$").WithMessage("Card number must be 13-19 digits")
            .Must(BeValidCardNumber).WithMessage("Invalid card number");

        RuleFor(x => x.CardHolderName)
            .NotEmpty().WithMessage("Card holder name is required")
            .Length(2, 100).WithMessage("Card holder name must be between 2 and 100 characters")
            .Matches("^[a-zA-Z\\s]+$").WithMessage("Card holder name can only contain letters and spaces");

        RuleFor(x => x.ExpiryMonth)
            .NotEmpty().WithMessage("Expiry month is required")
            .Matches("^(0[1-9]|1[0-2])$").WithMessage("Expiry month must be in MM format (01-12)");

        RuleFor(x => x.ExpiryYear)
            .NotEmpty().WithMessage("Expiry year is required")
            .Matches("^[0-9]{4}$").WithMessage("Expiry year must be in YYYY format")
            .Must(BeValidExpiryYear).WithMessage("Card has expired or expiry year is invalid");

        RuleFor(x => x.CVV)
            .NotEmpty().WithMessage("CVV is required")
            .Matches("^[0-9]{3,4}$").WithMessage("CVV must be 3 or 4 digits");

        RuleFor(x => x)
            .Must(HaveValidExpiryDate)
            .WithMessage("Card has expired")
            .When(x => !string.IsNullOrEmpty(x.ExpiryMonth) && !string.IsNullOrEmpty(x.ExpiryYear));
    }

    private bool BeValidCardNumber(string cardNumber)
    {
        // Simple Luhn algorithm check
        if (string.IsNullOrEmpty(cardNumber)) return false;
        
        int sum = 0;
        bool alternate = false;
        
        for (int i = cardNumber.Length - 1; i >= 0; i--)
        {
            if (!char.IsDigit(cardNumber[i])) return false;
            
            int digit = cardNumber[i] - '0';
            
            if (alternate)
            {
                digit *= 2;
                if (digit > 9) digit = (digit % 10) + 1;
            }
            
            sum += digit;
            alternate = !alternate;
        }
        
        return sum % 10 == 0;
    }

    private bool BeValidExpiryYear(string expiryYear)
    {
        if (!int.TryParse(expiryYear, out int year)) return false;
        var currentYear = DateTime.Now.Year;
        return year >= currentYear && year <= currentYear + 20;
    }

    private bool HaveValidExpiryDate(CreditCardDetails card)
    {
        if (!int.TryParse(card.ExpiryMonth, out int month) || 
            !int.TryParse(card.ExpiryYear, out int year))
            return false;

        var expiryDate = new DateTime(year, month, DateTime.DaysInMonth(year, month));
        return expiryDate >= DateTime.Now.Date;
    }
}

public class PayPalValidator : AbstractValidator<PayPalDetails>
{
    public PayPalValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("PayPal email is required")
            .EmailAddress().WithMessage("Please provide a valid PayPal email address");

        RuleFor(x => x.PayerId)
            .NotEmpty().WithMessage("PayPal Payer ID is required")
            .Length(13, 17).WithMessage("PayPal Payer ID must be 13-17 characters");
    }
}

public class BankTransferValidator : AbstractValidator<BankTransferDetails>
{
    public BankTransferValidator()
    {
        RuleFor(x => x.BankName)
            .NotEmpty().WithMessage("Bank name is required")
            .Length(2, 100).WithMessage("Bank name must be between 2 and 100 characters");

        RuleFor(x => x.AccountNumber)
            .NotEmpty().WithMessage("Account number is required")
            .Matches("^[0-9]{8,20}$").WithMessage("Account number must be 8-20 digits");

        RuleFor(x => x.RoutingNumber)
            .NotEmpty().WithMessage("Routing number is required")
            .Matches("^[0-9]{9}$").WithMessage("Routing number must be 9 digits");

        RuleFor(x => x.AccountHolderName)
            .NotEmpty().WithMessage("Account holder name is required")
            .Length(2, 100).WithMessage("Account holder name must be between 2 and 100 characters")
            .Matches("^[a-zA-Z\\s]+$").WithMessage("Account holder name can only contain letters and spaces");
    }
}

public class BillingAddressValidator : AbstractValidator<BillingAddress>
{
    public BillingAddressValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required")
            .Length(1, 50).WithMessage("First name must be between 1 and 50 characters");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required")
            .Length(1, 50).WithMessage("Last name must be between 1 and 50 characters");

        RuleFor(x => x.AddressLine1)
            .NotEmpty().WithMessage("Address line 1 is required")
            .Length(1, 200).WithMessage("Address line 1 must be between 1 and 200 characters");

        RuleFor(x => x.City)
            .NotEmpty().WithMessage("City is required")
            .Length(1, 100).WithMessage("City must be between 1 and 100 characters");

        RuleFor(x => x.State)
            .NotEmpty().WithMessage("State/Province is required")
            .Length(1, 100).WithMessage("State/Province must be between 1 and 100 characters");

        RuleFor(x => x.PostalCode)
            .NotEmpty().WithMessage("Postal code is required")
            .Length(1, 20).WithMessage("Postal code must be between 1 and 20 characters");

        RuleFor(x => x.Country)
            .NotEmpty().WithMessage("Country is required")
            .Length(2, 100).WithMessage("Country must be between 2 and 100 characters");
    }
}