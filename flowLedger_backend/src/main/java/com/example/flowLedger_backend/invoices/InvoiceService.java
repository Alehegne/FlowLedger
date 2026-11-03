package com.example.flowLedger_backend.invoices;

import com.example.flowLedger_backend.invoices.dto.CreateInvoiceInput;
import com.example.flowLedger_backend.invoices.dto.DashboardSummaryResponse;
import com.example.flowLedger_backend.invoices.dto.DuplicateCheckResponse;
import com.example.flowLedger_backend.invoices.dto.InvoiceActivityResponse;
import com.example.flowLedger_backend.invoices.dto.InvoiceResponse;
import com.example.flowLedger_backend.invoices.dto.PageResult;
import com.example.flowLedger_backend.invoices.dto.UpdateInvoiceInput;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;

    public InvoiceService(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    @Transactional
    public InvoiceResponse createDraft(UUID orgId, UUID userId, String userName, CreateInvoiceInput input) {
        Invoice invoice = buildFromInput(orgId, userId, input);
        invoice.setStatus("DRAFT");
        invoice.addActivity("CREATED_DRAFT", "Invoice draft created", userName, userId);

        Invoice saved = invoiceRepository.save(invoice);
        return mapToResponse(saved);
    }

    @Transactional
    public InvoiceResponse createAndSubmit(UUID orgId, UUID userId, String userName, CreateInvoiceInput input) {
        Invoice invoice = buildFromInput(orgId, userId, input);
        invoice.setStatus("PENDING_APPROVAL");
        invoice.addActivity("CREATED_DRAFT", "Invoice draft created", userName, userId);
        invoice.addActivity("SUBMITTED", "Submitted for approval", userName, userId);

        Invoice saved = invoiceRepository.save(invoice);
        return mapToResponse(saved);
    }

    @Transactional
    public InvoiceResponse updateDraft(UUID orgId, UUID invoiceId, String actorName, UUID actorId, UpdateInvoiceInput input) {
        Invoice invoice = invoiceRepository.findByIdAndOrganizationId(invoiceId, orgId)
                .orElseThrow(() -> new NoSuchElementException("Invoice not found: " + invoiceId));

        if (!"DRAFT".equals(invoice.getStatus()) && !"REJECTED".equals(invoice.getStatus())) {
            throw new IllegalStateException("Only DRAFT or REJECTED invoices can be edited");
        }

        if (input.supplierName() != null && !input.supplierName().isBlank()) {
            invoice.setSupplierName(input.supplierName().trim());
        }
        if (input.invoiceNumber() != null && !input.invoiceNumber().isBlank()) {
            invoice.setInvoiceNumber(input.invoiceNumber().trim());
        }
        if (input.amount() != null && !input.amount().isBlank()) {
            invoice.setTotalAmount(new BigDecimal(input.amount()));
        }
        if (input.currency() != null && !input.currency().isBlank()) {
            invoice.setCurrency(input.currency());
        }
        if (input.invoiceDate() != null && !input.invoiceDate().isBlank()) {
            invoice.setIssueDate(LocalDate.parse(input.invoiceDate()));
        }
        if (input.dueDate() != null) {
            invoice.setDueDate(input.dueDate().isBlank() ? null : LocalDate.parse(input.dueDate()));
        }
        if (input.description() != null) {
            invoice.setDescription(input.description());
        }

        // If previously rejected, editing moves it back to clean draft
        if ("REJECTED".equals(invoice.getStatus())) {
            invoice.setStatus("DRAFT");
            invoice.setRejectionReason(null);
        }

        invoice.addActivity("EDITED", "Draft invoice details updated", actorName, actorId);

        Invoice updated = invoiceRepository.save(invoice);
        return mapToResponse(updated);
    }

    @Transactional
    public InvoiceResponse submitForApproval(UUID orgId, UUID invoiceId, String actorName, UUID actorId) {
        Invoice invoice = invoiceRepository.findByIdAndOrganizationId(invoiceId, orgId)
                .orElseThrow(() -> new NoSuchElementException("Invoice not found: " + invoiceId));

        if (!"DRAFT".equals(invoice.getStatus()) && !"REJECTED".equals(invoice.getStatus())) {
            throw new IllegalStateException("Only DRAFT or REJECTED invoices can be submitted for approval");
        }

        invoice.setStatus("PENDING_APPROVAL");
        invoice.setRejectionReason(null);
        invoice.addActivity("SUBMITTED", "Submitted for approval", actorName, actorId);

        Invoice updated = invoiceRepository.save(invoice);
        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getById(UUID orgId, UUID invoiceId) {
        Invoice invoice = invoiceRepository.findByIdAndOrganizationId(invoiceId, orgId)
                .orElseThrow(() -> new NoSuchElementException("Invoice not found: " + invoiceId));
        return mapToResponse(invoice);
    }

    @Transactional(readOnly = true)
    public PageResult<InvoiceResponse> list(
            UUID orgId,
            String status,
            String search,
            String fromDateStr,
            String toDateStr,
            int page,
            int size,
            String sortBy,
            String sortDirection
    ) {
        String filterStatus = (status == null || "ALL".equalsIgnoreCase(status)) ? null : status.toUpperCase();
        String filterSearch = (search == null || search.isBlank()) ? null : search.trim();
        LocalDate fromDate = (fromDateStr == null || fromDateStr.isBlank()) ? null : LocalDate.parse(fromDateStr);
        LocalDate toDate = (toDateStr == null || toDateStr.isBlank()) ? null : LocalDate.parse(toDateStr);

        // Map frontend sort property names to entity properties
        String sortProperty = switch (sortBy != null ? sortBy : "createdAt") {
            case "invoiceDate" -> "issueDate";
            case "amount" -> "totalAmount";
            case "supplierName" -> "supplierName";
            case "invoiceNumber" -> "invoiceNumber";
            case "status" -> "status";
            default -> "createdAt";
        };

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDirection) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(Math.max(0, page - 1), Math.max(1, size), Sort.by(direction, sortProperty));

        var spec = InvoiceSpecifications.withFilters(orgId, filterStatus, filterSearch, fromDate, toDate);
        Page<Invoice> paged = invoiceRepository.findAll(spec, pageable);

        List<InvoiceResponse> items = paged.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return new PageResult<>(
                items,
                paged.getNumber() + 1,
                paged.getSize(),
                paged.getTotalElements(),
                paged.getTotalPages()
        );
    }

    @Transactional(readOnly = true)
    public DuplicateCheckResponse checkDuplicate(UUID orgId, String invoiceNumber, UUID excludeId) {
        if (invoiceNumber == null || invoiceNumber.isBlank()) {
            return new DuplicateCheckResponse(false);
        }

        boolean duplicate;
        if (excludeId != null) {
            duplicate = invoiceRepository.existsByOrganizationIdAndInvoiceNumberIgnoreCaseAndIdNot(orgId, invoiceNumber.trim(), excludeId);
        } else {
            duplicate = invoiceRepository.existsByOrganizationIdAndInvoiceNumberIgnoreCase(orgId, invoiceNumber.trim());
        }

        return new DuplicateCheckResponse(duplicate);
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary(UUID orgId) {
        long total = invoiceRepository.countByOrganizationId(orgId);
        long pending = invoiceRepository.countByOrganizationIdAndStatus(orgId, "PENDING_APPROVAL");
        long approved = invoiceRepository.countByOrganizationIdAndStatus(orgId, "APPROVED");
        long rejected = invoiceRepository.countByOrganizationIdAndStatus(orgId, "REJECTED");
        long draft = invoiceRepository.countByOrganizationIdAndStatus(orgId, "DRAFT");

        List<InvoiceResponse> recent = invoiceRepository.findTop5ByOrganizationIdOrderByCreatedAtDesc(orgId).stream()
                .map(this::mapToResponse)
                .toList();

        List<InvoiceResponse> pendingQueue = invoiceRepository.findTop5ByOrganizationIdAndStatusOrderByUpdatedAtDesc(orgId, "PENDING_APPROVAL").stream()
                .map(this::mapToResponse)
                .toList();

        return new DashboardSummaryResponse(total, pending, approved, rejected, draft, recent, pendingQueue);
    }

    private Invoice buildFromInput(UUID orgId, UUID userId, CreateInvoiceInput input) {
        LocalDate issueDate = LocalDate.parse(input.invoiceDate());
        LocalDate dueDate = (input.dueDate() != null && !input.dueDate().isBlank())
                ? LocalDate.parse(input.dueDate())
                : null;
        BigDecimal amount = new BigDecimal(input.amount());
        String currency = (input.currency() != null && !input.currency().isBlank()) ? input.currency() : "ETB";

        return new Invoice(
                orgId,
                input.invoiceNumber().trim(),
                input.supplierName().trim(),
                issueDate,
                dueDate,
                amount,
                currency,
                input.description(),
                userId
        );
    }

    public InvoiceResponse mapToResponse(Invoice invoice) {
        List<InvoiceActivityResponse> activities = invoice.getActivities().stream()
                .map(act -> new InvoiceActivityResponse(
                        act.getId(),
                        act.getType(),
                        act.getDescription(),
                        act.getActorName(),
                        act.getOccurredAt()
                ))
                .toList();

        return new InvoiceResponse(
                invoice.getId(),
                invoice.getSupplierName(),
                invoice.getInvoiceNumber(),
                invoice.getTotalAmount().toPlainString(),
                invoice.getCurrency(),
                invoice.getIssueDate(),
                invoice.getDueDate(),
                invoice.getDescription(),
                invoice.getStatus(),
                invoice.getRejectionReason(),
                activities,
                invoice.getCreatedAt(),
                invoice.getUpdatedAt()
        );
    }
}
