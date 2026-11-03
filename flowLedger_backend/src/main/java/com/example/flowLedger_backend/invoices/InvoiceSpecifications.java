package com.example.flowLedger_backend.invoices;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class InvoiceSpecifications {

    private InvoiceSpecifications() {}

    public static Specification<Invoice> withFilters(
            UUID orgId,
            String status,
            String search,
            LocalDate fromDate,
            LocalDate toDate
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("organizationId"), orgId));

            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(root.get("status"), status.toUpperCase()));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate supplierLike = cb.like(cb.lower(root.get("supplierName")), pattern);
                Predicate invoiceNumLike = cb.like(cb.lower(root.get("invoiceNumber")), pattern);
                predicates.add(cb.or(supplierLike, invoiceNumLike));
            }

            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("issueDate"), fromDate));
            }

            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("issueDate"), toDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
