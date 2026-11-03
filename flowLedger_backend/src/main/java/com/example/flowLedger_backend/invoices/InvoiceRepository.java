package com.example.flowLedger_backend.invoices;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID>, JpaSpecificationExecutor<Invoice> {

    Optional<Invoice> findByIdAndOrganizationId(UUID id, UUID organizationId);

    boolean existsByOrganizationIdAndInvoiceNumberIgnoreCase(UUID organizationId, String invoiceNumber);

    boolean existsByOrganizationIdAndInvoiceNumberIgnoreCaseAndIdNot(UUID organizationId, String invoiceNumber, UUID excludeId);

    long countByOrganizationId(UUID organizationId);

    long countByOrganizationIdAndStatus(UUID organizationId, String status);

    List<Invoice> findTop5ByOrganizationIdOrderByCreatedAtDesc(UUID organizationId);

    List<Invoice> findTop5ByOrganizationIdAndStatusOrderByUpdatedAtDesc(UUID organizationId, String status);

    @Query("""
        SELECT i FROM Invoice i
        WHERE i.organizationId = :orgId
          AND (:status IS NULL OR i.status = :status)
          AND (:search IS NULL OR LOWER(i.supplierName) LIKE LOWER(CONCAT('%', :search, '%'))
                               OR LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:fromDate IS NULL OR i.issueDate >= :fromDate)
          AND (:toDate IS NULL OR i.issueDate <= :toDate)
    """)
    Page<Invoice> searchInvoices(
            @Param("orgId") UUID orgId,
            @Param("status") String status,
            @Param("search") String search,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            Pageable pageable
    );

    @Query("""
        SELECT i FROM Invoice i
        WHERE i.organizationId = :orgId
          AND i.status = 'PENDING_APPROVAL'
          AND (:search IS NULL OR LOWER(i.supplierName) LIKE LOWER(CONCAT('%', :search, '%'))
                               OR LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<Invoice> findPendingApprovals(
            @Param("orgId") UUID orgId,
            @Param("search") String search,
            Pageable pageable
    );
}
