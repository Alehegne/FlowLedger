package com.example.flowLedger_backend.invoices;

import com.example.flowLedger_backend.invoices.dto.InvoiceResponse;
import com.example.flowLedger_backend.invoices.dto.PageResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class ApprovalService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceService invoiceService;

    public ApprovalService(InvoiceRepository invoiceRepository, InvoiceService invoiceService) {
        this.invoiceRepository = invoiceRepository;
        this.invoiceService = invoiceService;
    }

    @Transactional(readOnly = true)
    public PageResult<InvoiceResponse> listPending(UUID orgId, String search, int page, int size) {
        String filterSearch = (search == null || search.isBlank()) ? null : search.trim();
        Pageable pageable = PageRequest.of(Math.max(0, page - 1), Math.max(1, size), Sort.by(Sort.Direction.DESC, "updatedAt"));

        var spec = InvoiceSpecifications.withFilters(orgId, "PENDING_APPROVAL", filterSearch, null, null);
        Page<Invoice> paged = invoiceRepository.findAll(spec, pageable);

        List<InvoiceResponse> items = paged.getContent().stream()
                .map(invoiceService::mapToResponse)
                .toList();

        return new PageResult<>(
                items,
                paged.getNumber() + 1,
                paged.getSize(),
                paged.getTotalElements(),
                paged.getTotalPages()
        );
    }

    @Transactional
    public InvoiceResponse approve(UUID orgId, UUID invoiceId, String approverName, UUID approverId) {
        Invoice invoice = invoiceRepository.findByIdAndOrganizationId(invoiceId, orgId)
                .orElseThrow(() -> new NoSuchElementException("Invoice not found: " + invoiceId));

        if (!"PENDING_APPROVAL".equals(invoice.getStatus())) {
            throw new IllegalStateException("Only invoices in PENDING_APPROVAL status can be approved");
        }

        invoice.setStatus("APPROVED");
        invoice.addActivity("APPROVED", "Approved by " + approverName, approverName, approverId);

        Invoice updated = invoiceRepository.save(invoice);
        return invoiceService.mapToResponse(updated);
    }

    @Transactional
    public InvoiceResponse reject(UUID orgId, UUID invoiceId, String approverName, UUID approverId, String reason) {
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("A reason must be provided when rejecting an invoice");
        }

        Invoice invoice = invoiceRepository.findByIdAndOrganizationId(invoiceId, orgId)
                .orElseThrow(() -> new NoSuchElementException("Invoice not found: " + invoiceId));

        if (!"PENDING_APPROVAL".equals(invoice.getStatus())) {
            throw new IllegalStateException("Only invoices in PENDING_APPROVAL status can be rejected");
        }

        invoice.setStatus("REJECTED");
        invoice.setRejectionReason(reason.trim());
        invoice.addActivity("REJECTED", "Rejected: " + reason.trim(), approverName, approverId);

        Invoice updated = invoiceRepository.save(invoice);
        return invoiceService.mapToResponse(updated);
    }
}
