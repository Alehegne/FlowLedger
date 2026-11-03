package com.example.flowLedger_backend.invoices;

import com.example.flowLedger_backend.invoices.dto.CreateInvoiceInput;
import com.example.flowLedger_backend.invoices.dto.DashboardSummaryResponse;
import com.example.flowLedger_backend.invoices.dto.DuplicateCheckResponse;
import com.example.flowLedger_backend.invoices.dto.InvoiceResponse;
import com.example.flowLedger_backend.invoices.dto.PageResult;
import com.example.flowLedger_backend.invoices.dto.UpdateInvoiceInput;
import com.example.flowLedger_backend.security.AuthenticatedUserContext;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final AuthenticatedUserContext userContextResolver;

    public InvoiceController(InvoiceService invoiceService, AuthenticatedUserContext userContextResolver) {
        this.invoiceService = invoiceService;
        this.userContextResolver = userContextResolver;
    }

    @GetMapping
    public ResponseEntity<PageResult<InvoiceResponse>> listInvoices(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            Authentication authentication
    ) {
        var context = userContextResolver.resolve(authentication);
        PageResult<InvoiceResponse> result = invoiceService.list(
                context.organizationId(),
                status,
                search,
                fromDate,
                toDate,
                page,
                size,
                sortBy,
                sortDirection
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable UUID id, Authentication authentication) {
        var context = userContextResolver.resolve(authentication);
        InvoiceResponse response = invoiceService.getById(context.organizationId(), id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<InvoiceResponse> createDraft(
            @Valid @RequestBody CreateInvoiceInput input,
            Authentication authentication
    ) {
        var context = userContextResolver.resolve(authentication);
        InvoiceResponse response = invoiceService.createDraft(
                context.organizationId(),
                context.userId(),
                context.userName(),
                input
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/submit")
    public ResponseEntity<InvoiceResponse> createAndSubmit(
            @Valid @RequestBody CreateInvoiceInput input,
            Authentication authentication
    ) {
        var context = userContextResolver.resolve(authentication);
        InvoiceResponse response = invoiceService.createAndSubmit(
                context.organizationId(),
                context.userId(),
                context.userName(),
                input
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InvoiceResponse> updateDraft(
            @PathVariable UUID id,
            @RequestBody UpdateInvoiceInput input,
            Authentication authentication
    ) {
        var context = userContextResolver.resolve(authentication);
        InvoiceResponse response = invoiceService.updateDraft(
                context.organizationId(),
                id,
                context.userName(),
                context.userId(),
                input
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<InvoiceResponse> submitForApproval(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        var context = userContextResolver.resolve(authentication);
        InvoiceResponse response = invoiceService.submitForApproval(
                context.organizationId(),
                id,
                context.userName(),
                context.userId()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-duplicate")
    public ResponseEntity<DuplicateCheckResponse> checkDuplicate(
            @RequestParam String invoiceNumber,
            @RequestParam(required = false) UUID excludeId,
            Authentication authentication
    ) {
        var context = userContextResolver.resolve(authentication);
        DuplicateCheckResponse response = invoiceService.checkDuplicate(context.organizationId(), invoiceNumber, excludeId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary(Authentication authentication) {
        var context = userContextResolver.resolve(authentication);
        DashboardSummaryResponse response = invoiceService.getDashboardSummary(context.organizationId());
        return ResponseEntity.ok(response);
    }
}
