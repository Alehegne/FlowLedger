package com.example.flowLedger_backend.invoices;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InvoiceActivityRepository extends JpaRepository<InvoiceActivity, UUID> {

    List<InvoiceActivity> findByInvoiceIdOrderByOccurredAtDesc(UUID invoiceId);
}
