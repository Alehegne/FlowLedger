package com.example.flowLedger_backend.invoices;

import com.example.flowLedger_backend.PostgresIntegrationTestBase;
import com.example.flowLedger_backend.identity.AppUser;
import com.example.flowLedger_backend.identity.IdentityRepository;
import com.example.flowLedger_backend.organization.Organization;
import com.example.flowLedger_backend.organization.OrganizationMembership;
import com.example.flowLedger_backend.organization.OrganizationMembershipRepository;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class InvoiceIntegrationTest extends PostgresIntegrationTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private IdentityRepository identityRepository;

    @Autowired
    private OrganizationMembershipRepository membershipRepository;

    @Autowired
    private JwtService jwtService;

    private Cookie authCookie;
    private Organization testOrg;
    private AppUser testUser;

    @BeforeEach
    void setUp() {
        testOrg = organizationRepository.findById(UUID.fromString("11111111-1111-1111-1111-111111111111"))
                .orElseGet(() -> organizationRepository.save(new Organization(UUID.fromString("11111111-1111-1111-1111-111111111111"), "Acme Trading Co.")));

        testUser = identityRepository.findByEmailIgnoreCase("abebe@acme.co")
                .orElseGet(() -> identityRepository.save(new AppUser("abebe@acme.co", "hash", "Abebe Girma")));

        String token = jwtService.generateAccessToken(testUser, testOrg.getId(), "OWNER");
        authCookie = new Cookie("access_token", token);
    }

    @Test
    void createDraft_savesInvoiceAndLogsActivity() throws Exception {
        String inputJson = """
                {
                    "supplierName": "Addis Paper Supplies",
                    "invoiceNumber": "INV-1001",
                    "amount": "14500.50",
                    "currency": "ETB",
                    "invoiceDate": "2026-11-01",
                    "dueDate": "2026-11-15",
                    "description": "Office paper and stationery"
                }
                """;

        mockMvc.perform(post("/api/v1/invoices")
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(inputJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.supplierName").value("Addis Paper Supplies"))
                .andExpect(jsonPath("$.invoiceNumber").value("INV-1001"))
                .andExpect(jsonPath("$.amount").value("14500.50"))
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.activities[0].type").value("CREATED_DRAFT"));
    }

    @Test
    void checkDuplicate_detectsExistingInvoiceNumber() throws Exception {
        // Create draft first
        String inputJson = """
                {
                    "supplierName": "Tech Supplies",
                    "invoiceNumber": "DUP-CHECK-01",
                    "amount": "5000.00",
                    "currency": "ETB",
                    "invoiceDate": "2026-11-01"
                }
                """;

        mockMvc.perform(post("/api/v1/invoices")
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(inputJson))
                .andExpect(status().isCreated());

        // Check duplicate
        mockMvc.perform(get("/api/v1/invoices/check-duplicate")
                        .cookie(authCookie)
                        .param("invoiceNumber", "dup-check-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.duplicate").value(true));

        // Check non-duplicate
        mockMvc.perform(get("/api/v1/invoices/check-duplicate")
                        .cookie(authCookie)
                        .param("invoiceNumber", "UNIQUE-NUM-999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.duplicate").value(false));
    }

    @Test
    void createAndSubmit_setsPendingApprovalStatus() throws Exception {
        String inputJson = """
                {
                    "supplierName": "Direct Submit Supplies",
                    "invoiceNumber": "SUBMIT-001",
                    "amount": "8200.00",
                    "currency": "ETB",
                    "invoiceDate": "2026-11-02"
                }
                """;

        mockMvc.perform(post("/api/v1/invoices/submit")
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(inputJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING_APPROVAL"))
                .andExpect(jsonPath("$.activities.length()").value(2));
    }

    @Test
    void dashboardSummary_returnsAggregatedMetrics() throws Exception {
        mockMvc.perform(get("/api/v1/invoices/summary")
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalInvoices").isNumber())
                .andExpect(jsonPath("$.pendingApprovals").isNumber())
                .andExpect(jsonPath("$.recentInvoices").isArray());
    }
}
