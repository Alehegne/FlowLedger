package com.example.flowLedger_backend.invoices;

import com.example.flowLedger_backend.PostgresIntegrationTestBase;
import com.example.flowLedger_backend.identity.AppUser;
import com.example.flowLedger_backend.identity.IdentityRepository;
import com.example.flowLedger_backend.invoices.dto.CreateInvoiceInput;
import com.example.flowLedger_backend.invoices.dto.InvoiceResponse;
import com.example.flowLedger_backend.organization.Organization;
import com.example.flowLedger_backend.organization.OrganizationRepository;
import com.example.flowLedger_backend.security.JwtService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class ApprovalIntegrationTest extends PostgresIntegrationTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private IdentityRepository identityRepository;

    @Autowired
    private JwtService jwtService;

    private Cookie approverCookie;
    private Cookie viewerCookie;
    private Organization testOrg;
    private AppUser approverUser;
    private AppUser viewerUser;

    @BeforeEach
    void setUp() {
        testOrg = organizationRepository.findById(UUID.fromString("11111111-1111-1111-1111-111111111111")).orElseThrow();
        approverUser = identityRepository.findByEmailIgnoreCase("abebe@acme.co").orElseThrow();

        viewerUser = identityRepository.findByEmailIgnoreCase("viewer@acme.co")
                .orElseGet(() -> identityRepository.save(new AppUser("viewer@acme.co", "hash", "Viewer User")));

        String approverToken = jwtService.generateAccessToken(approverUser, testOrg.getId(), "APPROVER");
        approverCookie = new Cookie("access_token", approverToken);

        String viewerToken = jwtService.generateAccessToken(viewerUser, testOrg.getId(), "VIEWER");
        viewerCookie = new Cookie("access_token", viewerToken);
    }

    @Test
    void approve_transitionsStatusToApprovedAndLogsActivity() throws Exception {
        // Create an invoice submitted for approval
        CreateInvoiceInput input = new CreateInvoiceInput(
                "Approve Target Supplier",
                "APP-001",
                "3500.00",
                "ETB",
                "2026-11-01",
                null,
                "Ready for review"
        );
        InvoiceResponse pending = invoiceService.createAndSubmit(testOrg.getId(), approverUser.getId(), approverUser.getFullName(), input);

        // Approve it
        mockMvc.perform(post("/api/v1/approvals/" + pending.id() + "/approve")
                        .cookie(approverCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"))
                .andExpect(jsonPath("$.activities[0].type").value("APPROVED"))
                .andExpect(jsonPath("$.activities[0].actorName").value(approverUser.getFullName()));
    }

    @Test
    void reject_withReason_transitionsStatusToRejectedAndStoresReason() throws Exception {
        CreateInvoiceInput input = new CreateInvoiceInput(
                "Reject Target Supplier",
                "REJ-001",
                "12000.00",
                "ETB",
                "2026-11-01",
                null,
                "Under review"
        );
        InvoiceResponse pending = invoiceService.createAndSubmit(testOrg.getId(), approverUser.getId(), approverUser.getFullName(), input);

        String rejectBody = """
                {
                    "reason": "Missing purchase order attachment"
                }
                """;

        mockMvc.perform(post("/api/v1/approvals/" + pending.id() + "/reject")
                        .cookie(approverCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(rejectBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"))
                .andExpect(jsonPath("$.rejectionReason").value("Missing purchase order attachment"))
                .andExpect(jsonPath("$.activities[0].type").value("REJECTED"));
    }

    @Test
    void reject_withoutReason_returnsBadRequest() throws Exception {
        CreateInvoiceInput input = new CreateInvoiceInput(
                "Reject Target Supplier 2",
                "REJ-002",
                "12000.00",
                "ETB",
                "2026-11-01",
                null,
                "Under review"
        );
        InvoiceResponse pending = invoiceService.createAndSubmit(testOrg.getId(), approverUser.getId(), approverUser.getFullName(), input);

        String rejectBody = """
                {
                    "reason": ""
                }
                """;

        mockMvc.perform(post("/api/v1/approvals/" + pending.id() + "/reject")
                        .cookie(approverCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(rejectBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    void approve_asViewer_returnsForbidden() throws Exception {
        CreateInvoiceInput input = new CreateInvoiceInput(
                "Viewer Test Supplier",
                "VIEW-001",
                "1200.00",
                "ETB",
                "2026-11-01",
                null,
                "Test"
        );
        InvoiceResponse pending = invoiceService.createAndSubmit(testOrg.getId(), approverUser.getId(), approverUser.getFullName(), input);

        mockMvc.perform(post("/api/v1/approvals/" + pending.id() + "/approve")
                        .cookie(viewerCookie))
                .andExpect(status().isForbidden());
    }

    @Test
    void listPending_returnsPendingInvoicesQueue() throws Exception {
        mockMvc.perform(get("/api/v1/approvals/pending")
                        .cookie(approverCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray());
    }
}
