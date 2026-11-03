package com.example.flowLedger_backend.invoices;

import com.example.flowLedger_backend.invoices.dto.InvoiceResponse;
import com.example.flowLedger_backend.invoices.dto.PageResult;
import com.example.flowLedger_backend.invoices.dto.RejectInvoiceRequest;
import com.example.flowLedger_backend.security.AuthenticatedUserContext;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/approvals")
public class ApprovalController {

    private final ApprovalService approvalService;
    private final AuthenticatedUserContext userContextResolver;

    public ApprovalController(ApprovalService approvalService, AuthenticatedUserContext userContextResolver) {
        this.approvalService = approvalService;
        this.userContextResolver = userContextResolver;
    }

    @GetMapping("/pending")
    public ResponseEntity<PageResult<InvoiceResponse>> listPending(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        var context = userContextResolver.resolve(authentication);
        PageResult<InvoiceResponse> result = approvalService.listPending(
                context.organizationId(),
                search,
                page,
                size
        );
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<InvoiceResponse> approve(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        var context = userContextResolver.resolve(authentication);
        assertCanApprove(context.role());
        InvoiceResponse response = approvalService.approve(
                context.organizationId(),
                id,
                context.userName(),
                context.userId()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<InvoiceResponse> reject(
            @PathVariable UUID id,
            @Valid @RequestBody RejectInvoiceRequest request,
            Authentication authentication
    ) {
        var context = userContextResolver.resolve(authentication);
        assertCanApprove(context.role());
        InvoiceResponse response = approvalService.reject(
                context.organizationId(),
                id,
                context.userName(),
                context.userId(),
                request.reason()
        );
        return ResponseEntity.ok(response);
    }

    private void assertCanApprove(String role) {
        if (role == null || (!"OWNER".equalsIgnoreCase(role) &&
                             !"ADMIN".equalsIgnoreCase(role) &&
                             !"APPROVER".equalsIgnoreCase(role))) {
            throw new AccessDeniedException("Only approvers, admins, or owners can review invoices");
        }
    }
}
