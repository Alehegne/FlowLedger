import { describe, it, expect } from "vitest";
import {
  isValidDateOnly,
  isValidAmountString,
  validateCreateInvoiceInput,
  validateUpdateInvoiceInput,
  validateRejectionReason,
} from "@/lib/utils/validation";

describe("Validation Utilities", () => {
  describe("isValidDateOnly", () => {
    it("accepts valid calendar dates in YYYY-MM-DD format", () => {
      expect(isValidDateOnly("2026-10-15")).toBe(true);
      expect(isValidDateOnly("2024-02-29")).toBe(true); // leap year
    });

    it("rejects invalid date formats", () => {
      expect(isValidDateOnly("15-10-2026")).toBe(false);
      expect(isValidDateOnly("2026/10/15")).toBe(false);
      expect(isValidDateOnly("not-a-date")).toBe(false);
      expect(isValidDateOnly("")).toBe(false);
    });

    it("rejects non-existent calendar dates", () => {
      expect(isValidDateOnly("2026-02-31")).toBe(false);
      expect(isValidDateOnly("2026-04-31")).toBe(false);
      expect(isValidDateOnly("2026-13-01")).toBe(false);
      expect(isValidDateOnly("2025-02-29")).toBe(false); // non-leap year
    });
  });

  describe("isValidAmountString", () => {
    it("accepts valid positive decimal strings", () => {
      expect(isValidAmountString("100")).toBe(true);
      expect(isValidAmountString("100.5")).toBe(true);
      expect(isValidAmountString("100.50")).toBe(true);
      expect(isValidAmountString("12500.5000")).toBe(true);
      expect(isValidAmountString("0.05")).toBe(true);
    });

    it("rejects zero and negative amounts", () => {
      expect(isValidAmountString("0")).toBe(false);
      expect(isValidAmountString("0.00")).toBe(false);
      expect(isValidAmountString("-100")).toBe(false);
      expect(isValidAmountString("-50.25")).toBe(false);
    });

    it("rejects non-decimal strings or invalid formats", () => {
      expect(isValidAmountString("abc")).toBe(false);
      expect(isValidAmountString("100,00")).toBe(false);
      expect(isValidAmountString("$100")).toBe(false);
      expect(isValidAmountString("100.12345")).toBe(false); // exceeds 4 decimal places
      expect(isValidAmountString("")).toBe(false);
    });
  });

  describe("validateCreateInvoiceInput", () => {
    const validBaseInput = {
      supplierName: "Ethio Supplies Ltd.",
      invoiceNumber: "ETH-2026-0099",
      invoiceDate: "2026-10-15",
      dueDate: "2026-11-15",
      amount: "45000.00",
      currency: "ETB",
    };

    it("passes validation with complete valid input", () => {
      const result = validateCreateInvoiceInput(validBaseInput);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it("fails when required fields are missing", () => {
      const result = validateCreateInvoiceInput({});
      expect(result.isValid).toBe(false);
      expect(result.errors.supplierName).toBeDefined();
      expect(result.errors.invoiceNumber).toBeDefined();
      expect(result.errors.invoiceDate).toBeDefined();
      expect(result.errors.amount).toBeDefined();
      expect(result.errors.currency).toBeDefined();
    });

    it("fails when due date precedes invoice date", () => {
      const result = validateCreateInvoiceInput({
        ...validBaseInput,
        invoiceDate: "2026-10-20",
        dueDate: "2026-10-10",
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.dueDate).toContain("cannot be earlier");
    });

    it("allows optional due date to be omitted or null", () => {
      const result = validateCreateInvoiceInput({
        ...validBaseInput,
        dueDate: null,
      });
      expect(result.isValid).toBe(true);
    });

    it("rejects invalid amount string", () => {
      const result = validateCreateInvoiceInput({
        ...validBaseInput,
        amount: "invalid-amount",
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.amount).toBeDefined();
    });

    it("rejects currency codes that are not 3 uppercase letters", () => {
      const result = validateCreateInvoiceInput({
        ...validBaseInput,
        currency: "etb", // lowercase
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.currency).toBeDefined();
    });
  });

  describe("validateUpdateInvoiceInput", () => {
    it("validates partial updates on draft invoices", () => {
      const result = validateUpdateInvoiceInput(
        { amount: "99000.00" },
        "2026-10-15"
      );
      expect(result.isValid).toBe(true);
    });

    it("validates due date ordering during partial updates", () => {
      const result = validateUpdateInvoiceInput(
        { dueDate: "2026-10-01" },
        "2026-10-15"
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.dueDate).toContain("cannot be earlier");
    });
  });

  describe("validateRejectionReason", () => {
    it("accepts valid rejection reasons", () => {
      expect(validateRejectionReason("Incorrect total amount").isValid).toBe(true);
    });

    it("rejects empty or whitespace-only reasons", () => {
      expect(validateRejectionReason("").isValid).toBe(false);
      expect(validateRejectionReason("   ").isValid).toBe(false);
    });

    it("rejects reasons shorter than 3 characters", () => {
      expect(validateRejectionReason("no").isValid).toBe(false);
    });
  });
});
