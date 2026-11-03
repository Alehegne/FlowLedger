import type { CreateInvoiceInput, UpdateInvoiceInput } from "@/types/invoice";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates a date-only string in YYYY-MM-DD format.
 * Ensures the date is a real calendar date (e.g. rejects 2026-02-31).
 */
export function isValidDateOnly(dateStr: string): boolean {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const dateObj = new Date(year, month - 1, day);
  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day
  );
}

/**
 * Validates a decimal amount string.
 * Must be a positive decimal number with up to 4 decimal places.
 * Does not perform floating-point arithmetic.
 */
export function isValidAmountString(amountStr: string): boolean {
  if (!amountStr || typeof amountStr !== "string") return false;
  const trimmed = amountStr.trim();
  if (!trimmed) return false;

  // Positive decimal number matching 1 or more digits, optional decimal point and 1-4 fractional digits
  const decimalPattern = /^\d+(\.\d{1,4})?$/;
  if (!decimalPattern.test(trimmed)) return false;

  const num = parseFloat(trimmed);
  return !isNaN(num) && num > 0;
}

/**
 * Validates invoice creation inputs.
 */
export function validateCreateInvoiceInput(
  input: Partial<CreateInvoiceInput>
): ValidationResult {
  const errors: Record<string, string> = {};

  // Supplier Name
  if (!input.supplierName || !input.supplierName.trim()) {
    errors.supplierName = "Supplier name is required.";
  } else if (input.supplierName.trim().length > 200) {
    errors.supplierName = "Supplier name cannot exceed 200 characters.";
  }

  // Invoice Number
  if (!input.invoiceNumber || !input.invoiceNumber.trim()) {
    errors.invoiceNumber = "Invoice number is required.";
  } else if (input.invoiceNumber.trim().length > 100) {
    errors.invoiceNumber = "Invoice number cannot exceed 100 characters.";
  }

  // Invoice Date
  if (!input.invoiceDate || !input.invoiceDate.trim()) {
    errors.invoiceDate = "Invoice date is required.";
  } else if (!isValidDateOnly(input.invoiceDate.trim())) {
    errors.invoiceDate = "Invoice date must be a valid calendar date in YYYY-MM-DD format.";
  }

  // Due Date (optional)
  if (input.dueDate && input.dueDate.trim()) {
    const trimmedDue = input.dueDate.trim();
    if (!isValidDateOnly(trimmedDue)) {
      errors.dueDate = "Due date must be a valid calendar date in YYYY-MM-DD format.";
    } else if (
      input.invoiceDate &&
      isValidDateOnly(input.invoiceDate.trim()) &&
      trimmedDue < input.invoiceDate.trim()
    ) {
      errors.dueDate = "Due date cannot be earlier than invoice date.";
    }
  }

  // Amount
  if (!input.amount || !input.amount.trim()) {
    errors.amount = "Amount is required.";
  } else if (!isValidAmountString(input.amount)) {
    errors.amount = "Amount must be a positive decimal number with up to 4 decimal places (e.g. 1250.00).";
  }

  // Currency
  if (!input.currency || !input.currency.trim()) {
    errors.currency = "Currency is required.";
  } else if (!/^[A-Z]{3}$/.test(input.currency.trim())) {
    errors.currency = "Currency must be a 3-letter ISO code (e.g. ETB).";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates invoice update inputs (for editing drafts).
 */
export function validateUpdateInvoiceInput(
  input: UpdateInvoiceInput,
  currentInvoiceDate?: string
): ValidationResult {
  const errors: Record<string, string> = {};

  if (input.supplierName !== undefined) {
    if (!input.supplierName.trim()) {
      errors.supplierName = "Supplier name cannot be empty.";
    } else if (input.supplierName.trim().length > 200) {
      errors.supplierName = "Supplier name cannot exceed 200 characters.";
    }
  }

  if (input.invoiceNumber !== undefined) {
    if (!input.invoiceNumber.trim()) {
      errors.invoiceNumber = "Invoice number cannot be empty.";
    } else if (input.invoiceNumber.trim().length > 100) {
      errors.invoiceNumber = "Invoice number cannot exceed 100 characters.";
    }
  }

  const effectiveInvoiceDate = input.invoiceDate?.trim() || currentInvoiceDate;

  if (input.invoiceDate !== undefined) {
    if (!input.invoiceDate.trim()) {
      errors.invoiceDate = "Invoice date is required.";
    } else if (!isValidDateOnly(input.invoiceDate.trim())) {
      errors.invoiceDate = "Invoice date must be a valid calendar date in YYYY-MM-DD format.";
    }
  }

  if (input.dueDate !== undefined && input.dueDate !== null && input.dueDate.trim() !== "") {
    const trimmedDue = input.dueDate.trim();
    if (!isValidDateOnly(trimmedDue)) {
      errors.dueDate = "Due date must be a valid calendar date in YYYY-MM-DD format.";
    } else if (effectiveInvoiceDate && isValidDateOnly(effectiveInvoiceDate) && trimmedDue < effectiveInvoiceDate) {
      errors.dueDate = "Due date cannot be earlier than invoice date.";
    }
  }

  if (input.amount !== undefined) {
    if (!isValidAmountString(input.amount)) {
      errors.amount = "Amount must be a positive decimal number with up to 4 decimal places.";
    }
  }

  if (input.currency !== undefined) {
    if (!/^[A-Z]{3}$/.test(input.currency.trim())) {
      errors.currency = "Currency must be a 3-letter ISO code (e.g. ETB).";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates a rejection reason.
 * Rejection reason is required and must have meaningful content.
 */
export function validateRejectionReason(reason: string): { isValid: boolean; error?: string } {
  if (!reason || !reason.trim()) {
    return { isValid: false, error: "A rejection reason is required." };
  }
  if (reason.trim().length < 3) {
    return { isValid: false, error: "Rejection reason must be at least 3 characters." };
  }
  return { isValid: true };
}
