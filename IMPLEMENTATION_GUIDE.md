# Ginuma ERP - Missing Features Implementation Guide
**Complete Step-by-Step Guide for Missing Modules**

---

## 📋 Table of Contents
1. [Dashboard Analytics (Real Calculations)](#1-dashboard-analytics)
2. [Money Transactions Module](#2-money-transactions-module)
3. [Bank Reconciliation Module](#3-bank-reconciliation-module)
4. [Quotations Module](#4-quotations-module)
5. [Financial Reports](#5-financial-reports)
6. [Payroll System](#6-payroll-system)
7. [Advanced Inventory Features](#7-advanced-inventory-features)

---

## Implementation Priority Order

**Priority 1 (Critical for Basic Operations):**
1. Money Transactions (Spend/Receive)
2. Dashboard Analytics
3. Quotations Module

**Priority 2 (Essential for Accounting):**
4. Financial Reports (General Ledger, Trial Balance)
5. Bank Reconciliation

**Priority 3 (Advanced Features):**
6. Income Statement, Balance Sheet, Cashflow
7. Payroll System
8. Advanced Inventory

---

## 1. Dashboard Analytics (Real Calculations)

### Current Status
- Backend returns hardcoded zeros
- No real calculation of revenue, expenses, profit
- Empty arrays for charts

### Database Tables Required
✅ Already exists: `Account`, `JournalEntry`, `JournalEntryLine`, `SalesOrder`, `PurchaseOrder`

### Backend Implementation

#### Step 1.1: Create Dashboard Service
**File:** `src/main/java/com/example/GinumApps/service/DashboardService.java`

```java
@Service
public interface DashboardService {
    DashboardStatsDto getCompanyDashboardStats(Integer companyId);
    List<RecentTransactionDto> getRecentTransactions(Integer companyId, int limit);
    List<TopClientDto> getTopClients(Integer companyId, int limit);
    Map<String, Double> getMonthlyRevenue(Integer companyId, int months);
}
```

#### Step 1.2: Create Dashboard DTOs
**File:** `src/main/java/com/example/GinumApps/dto/DashboardStatsDto.java`

```java
@Data
public class DashboardStatsDto {
    private Double revenue;
    private Double prevRevenue;
    private Double revenueChange;
    
    private Double expenses;
    private Double prevExpenses;
    private Double expensesChange;
    
    private Double profit;
    private Double prevProfit;
    private Double profitChange;
    
    private List<RecentTransactionDto> recentTransactions;
    private List<TopClientDto> topClients;
    private Map<String, Double> monthlyRevenue;
}
```

#### Step 1.3: Implement Service Logic
**File:** `src/main/java/com/example/GinumApps/service/impl/DashboardServiceImpl.java`

**Logic Required:**
1. **Calculate Revenue:**
   - Query SalesOrder table where `companyId` matches
   - Filter by status = 'COMPLETED' or 'INVOICED'
   - Sum `totalAmount` for current month
   - Sum `totalAmount` for previous month
   - Calculate percentage change

2. **Calculate Expenses:**
   - Query PurchaseOrder table where `companyId` matches
   - Filter by status = 'COMPLETED'
   - Sum `totalAmount` for current month and previous month
   - Calculate percentage change

3. **Calculate Profit:**
   - Profit = Revenue - Expenses
   - Compare current vs previous month

4. **Recent Transactions:**
   - Query JournalEntry table
   - Order by `transactionDate` DESC
   - Limit to 10 most recent
   - Include: date, description, amount, type

5. **Top Clients:**
   - Query SalesOrder grouped by `customerId`
   - Sum total sales per customer
   - Order DESC by total
   - Limit to 5
   - Join with Customer table to get names

#### Step 1.4: Update Controller
**File:** `src/main/java/com/example/GinumApps/controller/DashboardController.java`

Replace the hardcoded stats with service calls:
```java
@GetMapping("/stats")
public ResponseEntity<DashboardStatsDto> getCompanyDashboardStats(@PathVariable Integer companyId) {
    DashboardStatsDto stats = dashboardService.getCompanyDashboardStats(companyId);
    return ResponseEntity.ok(stats);
}
```

### Frontend Integration

#### Step 1.5: Update Dashboard API Call
**File:** `src/pages/Dashboard/DashboardPage.jsx`

Update the `fetchDashboardData` function to:
1. Call `/api/companies/{companyId}/dashboard/stats`
2. Parse the response
3. Set state for revenue, expenses, profit
4. Display percentage changes (green for positive, red for negative)
5. Render recentTransactions in a table
6. Render topClients with Chart.js

#### Step 1.6: Add Charts
Use `react-chartjs-2` to create:
1. **Monthly Revenue Line Chart** - Show last 6 months revenue trend
2. **Top Clients Bar Chart** - Show top 5 clients by sales
3. **Revenue vs Expenses Comparison** - Bar chart comparing both

---

## 2. Money Transactions Module

### Current Status
- UI exists but uses hardcoded data
- No backend API or database model

### Database Tables Required

#### Step 2.1: Create MoneyTransaction Entity
**File:** `src/main/java/com/example/GinumApps/model/MoneyTransaction.java`

**Fields:**
```java
@Entity
public class MoneyTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    private Company company;
    
    @Enumerated(EnumType.STRING)
    private TransactionType type; // SPEND_MONEY, RECEIVE_MONEY
    
    private String transactionNumber; // Auto-generated: MT-2025-0001
    
    private LocalDate transactionDate;
    
    @ManyToOne
    private BankAccount bankAccount; // Which bank/cash account
    
    @Enumerated(EnumType.STRING)
    private PayeeType payeeType; // SUPPLIER, CUSTOMER, EMPLOYEE, OTHER
    
    private Integer payeeId; // References supplier_id, customer_id, or employee_id
    
    private String payeeName; // Denormalized for easy display
    
    @ManyToOne
    private Account chargeAccount; // Expense or Income account
    
    private Double amount;
    
    private String description;
    
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod; // CASH, CHEQUE, BANK_TRANSFER
    
    private String referenceNumber; // Cheque number or reference
    
    @ManyToOne
    private Project project; // Optional: Link to project
    
    private LocalDateTime createdAt;
    
    @ManyToOne
    private AppUser createdBy;
}
```

#### Step 2.2: Create Enums
**File:** `src/main/java/com/example/GinumApps/enums/TransactionType.java`
```java
public enum TransactionType {
    SPEND_MONEY,
    RECEIVE_MONEY
}
```

**File:** `src/main/java/com/example/GinumApps/enums/PayeeType.java`
```java
public enum PayeeType {
    SUPPLIER,
    CUSTOMER,
    EMPLOYEE,
    OTHER
}
```

**File:** `src/main/java/com/example/GinumApps/enums/PaymentMethod.java`
```java
public enum PaymentMethod {
    CASH,
    CHEQUE,
    BANK_TRANSFER,
    CREDIT_CARD
}
```

### Backend Implementation

#### Step 2.3: Create Repository
**File:** `src/main/java/com/example/GinumApps/repository/MoneyTransactionRepository.java`

```java
public interface MoneyTransactionRepository extends JpaRepository<MoneyTransaction, Integer> {
    List<MoneyTransaction> findByCompanyIdOrderByTransactionDateDesc(Integer companyId);
    List<MoneyTransaction> findByCompanyIdAndType(Integer companyId, TransactionType type);
    Optional<MoneyTransaction> findTopByCompanyIdOrderByIdDesc(Integer companyId);
}
```

#### Step 2.4: Create DTOs
**Request DTO:** `MoneyTransactionRequestDto.java`
```java
@Data
public class MoneyTransactionRequestDto {
    @NotNull private TransactionType type;
    @NotNull private LocalDate transactionDate;
    @NotNull private Integer bankAccountId;
    @NotNull private PayeeType payeeType;
    @NotNull private Integer payeeId;
    @NotNull private Integer chargeAccountId;
    @NotNull private Double amount;
    private String description;
    @NotNull private PaymentMethod paymentMethod;
    private String referenceNumber;
    private Integer projectId;
}
```

**Response DTO:** `MoneyTransactionResponseDto.java`
```java
@Data
public class MoneyTransactionResponseDto {
    private Integer id;
    private String transactionNumber;
    private TransactionType type;
    private LocalDate transactionDate;
    private String bankAccountName;
    private String payeeName;
    private String chargeAccountName;
    private Double amount;
    private String description;
    private PaymentMethod paymentMethod;
    private String referenceNumber;
    private String projectName;
    private String createdByName;
    private LocalDateTime createdAt;
}
```

#### Step 2.5: Create Service
**Interface:** `MoneyTransactionService.java`
```java
public interface MoneyTransactionService {
    MoneyTransaction createTransaction(Integer companyId, MoneyTransactionRequestDto request, Integer userId);
    List<MoneyTransactionResponseDto> getAllTransactions(Integer companyId);
    List<MoneyTransactionResponseDto> getTransactionsByType(Integer companyId, TransactionType type);
    MoneyTransactionResponseDto getTransactionById(Integer id);
    String generateTransactionNumber(Integer companyId);
}
```

**Implementation:** `MoneyTransactionServiceImpl.java`

**Key Logic:**
1. **Generate Transaction Number:**
   - Format: `MT-2025-0001`
   - Get last transaction for company
   - Increment the number
   - Include current year

2. **Create Transaction:**
   - Validate bank account exists and belongs to company
   - Validate payee exists (supplier/customer/employee)
   - Validate charge account exists
   - Generate transaction number
   - Save MoneyTransaction
   - **Create Journal Entry (Double Entry):**
     - For SPEND_MONEY:
       - Debit: Charge Account (Expense)
       - Credit: Bank Account (Asset)
     - For RECEIVE_MONEY:
       - Debit: Bank Account (Asset)
       - Credit: Charge Account (Income)

3. **Get Payee Name:**
   - Based on payeeType, query appropriate table
   - Return name for display

#### Step 2.6: Create Controller
**File:** `src/main/java/com/example/GinumApps/controller/MoneyTransactionController.java`

```java
@RestController
@RequestMapping("/api/companies/{companyId}/money-transactions")
public class MoneyTransactionController {
    
    @PostMapping
    public ResponseEntity<MoneyTransaction> createTransaction(
        @PathVariable Integer companyId,
        @Valid @RequestBody MoneyTransactionRequestDto request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Implementation
    }
    
    @GetMapping
    public ResponseEntity<List<MoneyTransactionResponseDto>> getAllTransactions(
        @PathVariable Integer companyId
    ) {
        // Implementation
    }
    
    @GetMapping("/type/{type}")
    public ResponseEntity<List<MoneyTransactionResponseDto>> getByType(
        @PathVariable Integer companyId,
        @PathVariable TransactionType type
    ) {
        // Implementation
    }
}
```

### Frontend Integration

#### Step 2.7: Update MoneyTransaction.jsx

**Replace hardcoded data with API calls:**

1. **Fetch Real Payees:**
```javascript
const fetchPayees = async () => {
    const companyId = sessionStorage.getItem("companyId");
    
    // Fetch suppliers
    const suppliersRes = await api.get(`/api/companies/${companyId}/suppliers`);
    setSuppliers(suppliersRes.data);
    
    // Fetch customers
    const customersRes = await api.get(`/api/companies/${companyId}/customers`);
    setCustomers(customersRes.data);
    
    // Fetch employees
    const employeesRes = await api.get(`/api/companies/${companyId}/employees`);
    setEmployees(employeesRes.data);
};
```

2. **Fetch Bank Accounts:**
```javascript
const fetchBankAccounts = async () => {
    const companyId = sessionStorage.getItem("companyId");
    const response = await api.get(`/api/companies/${companyId}/bank-accounts`);
    setBankAccounts(response.data);
};
```

3. **Fetch Charge Accounts:**
```javascript
const fetchAccounts = async () => {
    const companyId = sessionStorage.getItem("companyId");
    const response = await api.get(`/api/companies/${companyId}/accounts`);
    
    // Filter expense accounts for Spend Money
    const expenseAccounts = response.data.filter(a => 
        a.accountType === 'EXPENSE'
    );
    
    // Filter income accounts for Receive Money
    const incomeAccounts = response.data.filter(a => 
        a.accountType === 'INCOME'
    );
    
    setExpenseAccounts(expenseAccounts);
    setIncomeAccounts(incomeAccounts);
};
```

4. **Submit Transaction:**
```javascript
const handleSubmit = async () => {
    const companyId = sessionStorage.getItem("companyId");
    
    const payload = {
        type: transactionType, // SPEND_MONEY or RECEIVE_MONEY
        transactionDate: date,
        bankAccountId: selectedBankAccount,
        payeeType: payeeType, // SUPPLIER, CUSTOMER, EMPLOYEE
        payeeId: selectedPayee,
        chargeAccountId: selectedAccount,
        amount: parseFloat(amount),
        description: description,
        paymentMethod: paymentMethod,
        referenceNumber: reference,
        projectId: selectedProject || null
    };
    
    try {
        await api.post(`/api/companies/${companyId}/money-transactions`, payload);
        Alert.success("Transaction created successfully!");
        // Reset form and refresh list
    } catch (error) {
        Alert.error("Failed to create transaction");
    }
};
```

5. **Display Transaction History:**
- Fetch all transactions on component mount
- Display in a table with filters
- Show transaction type badge (Spend/Receive)
- Format dates and amounts properly

---

## 3. Bank Reconciliation Module

### Current Status
- UI exists with mock data
- No real backend integration

### Database Tables Required

#### Step 3.1: Create BankReconciliation Entity
**File:** `src/main/java/com/example/GinumApps/model/BankReconciliation.java`

```java
@Entity
public class BankReconciliation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    private Company company;
    
    @ManyToOne
    private BankAccount bankAccount;
    
    private LocalDate statementDate;
    private Double statementBalance;
    private Double bookBalance;
    private Double difference;
    
    @Enumerated(EnumType.STRING)
    private ReconciliationStatus status; // DRAFT, COMPLETED
    
    @OneToMany(mappedBy = "reconciliation")
    private List<ReconciliationItem> items;
    
    private LocalDateTime reconciledAt;
    
    @ManyToOne
    private AppUser reconciledBy;
}
```

#### Step 3.2: Create ReconciliationItem Entity
```java
@Entity
public class ReconciliationItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    private BankReconciliation reconciliation;
    
    @ManyToOne
    private MoneyTransaction transaction;
    
    private Boolean cleared; // Has this item cleared the bank?
    
    private LocalDate clearedDate;
}
```

### Backend Implementation

#### Step 3.3: Create Repository & Service
**Repository:** `BankReconciliationRepository.java`
```java
public interface BankReconciliationRepository extends JpaRepository<BankReconciliation, Integer> {
    List<BankReconciliation> findByCompanyIdOrderByStatementDateDesc(Integer companyId);
    List<BankReconciliation> findByBankAccountId(Integer bankAccountId);
}
```

**Service Logic:**
1. **Get Unreconciled Transactions:**
   - Query MoneyTransaction where `bankAccountId` matches
   - Filter out transactions already marked as cleared
   - Return list with `cleared = false`

2. **Create Reconciliation:**
   - Accept statement date and balance
   - Calculate book balance from transactions
   - Calculate difference
   - Save reconciliation record

3. **Mark Transactions as Cleared:**
   - Update ReconciliationItem records
   - Set `cleared = true`
   - Set `clearedDate`

4. **Complete Reconciliation:**
   - Validate that difference = 0 or within tolerance
   - Update status to COMPLETED
   - Prevent future edits

#### Step 3.4: Create Controller Endpoints
```java
@RestController
@RequestMapping("/api/companies/{companyId}/reconciliation")
public class BankReconciliationController {
    
    // Get unreconciled transactions for a bank account
    @GetMapping("/bank-accounts/{bankAccountId}/unreconciled")
    public ResponseEntity<List<MoneyTransactionResponseDto>> getUnreconciledTransactions(
        @PathVariable Integer companyId,
        @PathVariable Integer bankAccountId
    );
    
    // Start a new reconciliation
    @PostMapping
    public ResponseEntity<BankReconciliation> startReconciliation(
        @PathVariable Integer companyId,
        @RequestBody ReconciliationRequestDto request
    );
    
    // Mark transactions as cleared
    @PutMapping("/{reconciliationId}/items")
    public ResponseEntity<?> updateClearedItems(
        @PathVariable Integer reconciliationId,
        @RequestBody List<ClearedItemDto> clearedItems
    );
    
    // Complete reconciliation
    @PostMapping("/{reconciliationId}/complete")
    public ResponseEntity<?> completeReconciliation(
        @PathVariable Integer reconciliationId
    );
}
```

### Frontend Integration

#### Step 3.5: Update BankReconsilation.jsx

Replace mock transactions with real API data:

1. **Fetch Unreconciled Transactions:**
```javascript
const fetchUnreconciledTransactions = async () => {
    const companyId = sessionStorage.getItem("companyId");
    const response = await api.get(
        `/api/companies/${companyId}/reconciliation/bank-accounts/${selectedBankCode}/unreconciled`
    );
    setTransactions(response.data);
};
```

2. **Start Reconciliation:**
```javascript
const handleStartReconciliation = async () => {
    const companyId = sessionStorage.getItem("companyId");
    const payload = {
        bankAccountId: selectedBankCode,
        statementDate: statementDate,
        statementBalance: parseFloat(statementBalance)
    };
    
    const response = await api.post(
        `/api/companies/${companyId}/reconciliation`,
        payload
    );
    setReconciliationId(response.data.id);
};
```

3. **Toggle Cleared Status:**
```javascript
const toggleClear = (transactionId) => {
    setTransactions(prev => prev.map(t => 
        t.id === transactionId 
            ? { ...t, cleared: !t.cleared }
            : t
    ));
};
```

4. **Complete Reconciliation:**
```javascript
const handleComplete = async () => {
    const clearedItems = transactions
        .filter(t => t.cleared)
        .map(t => ({ transactionId: t.id, cleared: true }));
    
    await api.put(
        `/api/companies/${companyId}/reconciliation/${reconciliationId}/items`,
        clearedItems
    );
    
    await api.post(
        `/api/companies/${companyId}/reconciliation/${reconciliationId}/complete`
    );
    
    Alert.success("Reconciliation completed!");
};
```

5. **Display Balances:**
- Book Balance = Sum of all cleared transactions
- Statement Balance = User input
- Difference = Statement Balance - Book Balance
- Show warning if difference !== 0

---

## 4. Quotations Module

### Current Status
- Empty placeholder components
- No backend support

### Database Tables Required

#### Step 4.1: Create Quotation Entity
**File:** `src/main/java/com/example/GinumApps/model/Quotation.java`

```java
@Entity
public class Quotation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    private Company company;
    
    private String quotationNumber; // QT-2025-0001
    
    @ManyToOne
    private Customer customer;
    
    private LocalDate quotationDate;
    private LocalDate validUntil; // Expiry date
    
    @Enumerated(EnumType.STRING)
    private QuotationStatus status; // DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED
    
    @OneToMany(mappedBy = "quotation", cascade = CascadeType.ALL)
    private List<QuotationLineItem> lineItems;
    
    private Double subtotal;
    private Double taxAmount;
    private Double discountAmount;
    private Double totalAmount;
    
    private String notes;
    private String termsAndConditions;
    
    private LocalDateTime createdAt;
    
    @ManyToOne
    private AppUser createdBy;
    
    private LocalDateTime sentAt;
    private LocalDateTime acceptedAt;
    private Integer convertedToSalesOrderId; // Reference to SalesOrder if accepted
}
```

#### Step 4.2: Create QuotationLineItem Entity
```java
@Entity
public class QuotationLineItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    private Quotation quotation;
    
    @ManyToOne
    private Item item;
    
    private String description;
    private Double quantity;
    private Double unitPrice;
    private Double discountPercent;
    private Double taxPercent;
    private Double lineTotal;
}
```

#### Step 4.3: Create Enum
**File:** `src/main/java/com/example/GinumApps/enums/QuotationStatus.java`
```java
public enum QuotationStatus {
    DRAFT,
    SENT,
    ACCEPTED,
    REJECTED,
    EXPIRED
}
```

### Backend Implementation

#### Step 4.4: Create Repository
```java
public interface QuotationRepository extends JpaRepository<Quotation, Integer> {
    List<Quotation> findByCompanyIdOrderByQuotationDateDesc(Integer companyId);
    List<Quotation> findByCustomerId(Integer customerId);
    List<Quotation> findByStatus(QuotationStatus status);
    Optional<Quotation> findTopByCompanyIdOrderByIdDesc(Integer companyId);
}
```

#### Step 4.5: Create Service
**Key Methods:**
1. **createQuotation** - Create new quotation with line items
2. **updateQuotation** - Edit draft quotation
3. **sendQuotation** - Mark as SENT, set sentAt timestamp
4. **acceptQuotation** - Mark as ACCEPTED, convert to SalesOrder
5. **rejectQuotation** - Mark as REJECTED
6. **getQuotationsByCompany** - List all quotations
7. **getQuotationById** - Get single quotation with line items
8. **generateQuotationNumber** - Auto-generate: QT-2025-0001

**Convert to Sales Order Logic:**
```java
public SalesOrder convertQuotationToSalesOrder(Integer quotationId) {
    Quotation quotation = quotationRepository.findById(quotationId);
    
    // Create new SalesOrder
    SalesOrder salesOrder = new SalesOrder();
    salesOrder.setCustomer(quotation.getCustomer());
    salesOrder.setOrderDate(LocalDate.now());
    // Copy line items from quotation
    // Copy amounts
    // Set reference to quotation
    
    // Update quotation status
    quotation.setStatus(QuotationStatus.ACCEPTED);
    quotation.setConvertedToSalesOrderId(salesOrder.getId());
    
    return salesOrderRepository.save(salesOrder);
}
```

#### Step 4.6: Create Controller
```java
@RestController
@RequestMapping("/api/companies/{companyId}/quotations")
public class QuotationController {
    
    @PostMapping
    public ResponseEntity<Quotation> createQuotation(
        @PathVariable Integer companyId,
        @Valid @RequestBody QuotationRequestDto request
    );
    
    @GetMapping
    public ResponseEntity<List<QuotationResponseDto>> getAllQuotations(
        @PathVariable Integer companyId
    );
    
    @GetMapping("/{id}")
    public ResponseEntity<QuotationResponseDto> getQuotationById(
        @PathVariable Integer id
    );
    
    @PutMapping("/{id}")
    public ResponseEntity<Quotation> updateQuotation(
        @PathVariable Integer id,
        @RequestBody QuotationRequestDto request
    );
    
    @PostMapping("/{id}/send")
    public ResponseEntity<?> sendQuotation(@PathVariable Integer id);
    
    @PostMapping("/{id}/accept")
    public ResponseEntity<SalesOrder> acceptQuotation(@PathVariable Integer id);
    
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectQuotation(@PathVariable Integer id);
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuotation(@PathVariable Integer id);
}
```

### Frontend Implementation

#### Step 4.7: Implement CreateQuotation.jsx

**Form Fields:**
1. Customer (Dropdown from API)
2. Quotation Date (Date picker)
3. Valid Until (Date picker)
4. Line Items Table:
   - Item (Dropdown from inventory)
   - Description
   - Quantity
   - Unit Price
   - Discount %
   - Tax %
   - Line Total (Auto-calculated)
5. Subtotal (Auto-calculated)
6. Discount
7. Tax
8. Total Amount
9. Notes
10. Terms & Conditions

**Auto-calculations:**
```javascript
const calculateLineTotal = (qty, unitPrice, discount, tax) => {
    const subtotal = qty * unitPrice;
    const discountAmt = subtotal * (discount / 100);
    const afterDiscount = subtotal - discountAmt;
    const taxAmt = afterDiscount * (tax / 100);
    return afterDiscount + taxAmt;
};

const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => 
        sum + (item.quantity * item.unitPrice), 0
    );
    const totalDiscount = lineItems.reduce((sum, item) => 
        sum + (item.quantity * item.unitPrice * item.discountPercent / 100), 0
    );
    const totalTax = lineItems.reduce((sum, item) => {
        const afterDiscount = (item.quantity * item.unitPrice) - 
            (item.quantity * item.unitPrice * item.discountPercent / 100);
        return sum + (afterDiscount * item.taxPercent / 100);
    }, 0);
    const total = subtotal - totalDiscount + totalTax;
    
    setSubtotal(subtotal);
    setDiscountAmount(totalDiscount);
    setTaxAmount(totalTax);
    setTotalAmount(total);
};
```

**Submit API:**
```javascript
const handleSubmit = async () => {
    const companyId = sessionStorage.getItem("companyId");
    
    const payload = {
        customerId: selectedCustomer,
        quotationDate: quotationDate,
        validUntil: validUntil,
        lineItems: lineItems.map(item => ({
            itemId: item.itemId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountPercent: item.discountPercent,
            taxPercent: item.taxPercent,
            lineTotal: item.lineTotal
        })),
        subtotal: subtotal,
        taxAmount: taxAmount,
        discountAmount: discountAmount,
        totalAmount: totalAmount,
        notes: notes,
        termsAndConditions: terms
    };
    
    try {
        await api.post(`/api/companies/${companyId}/quotations`, payload);
        Alert.success("Quotation created successfully!");
        navigate("/quotations");
    } catch (error) {
        Alert.error("Failed to create quotation");
    }
};
```

#### Step 4.8: Implement AllQuotations.jsx

**Features:**
1. **List View:**
   - Table with columns: Quotation #, Date, Customer, Valid Until, Amount, Status
   - Status badges (color-coded)
   - Search/Filter by customer name, status, date range

2. **Actions:**
   - View Details
   - Edit (only DRAFT)
   - Send (DRAFT → SENT)
   - Accept (SENT → ACCEPTED, convert to Sales Order)
   - Reject (SENT → REJECTED)
   - Delete (only DRAFT)
   - Download PDF

3. **Status Workflow:**
```javascript
const handleSend = async (id) => {
    await api.post(`/api/companies/${companyId}/quotations/${id}/send`);
    Alert.success("Quotation sent to customer");
    fetchQuotations();
};

const handleAccept = async (id) => {
    const result = await api.post(`/api/companies/${companyId}/quotations/${id}/accept`);
    Alert.success(`Quotation accepted! Sales Order #${result.data.orderNumber} created`);
    navigate(`/sales/${result.data.id}`);
};
```

---

## 5. Financial Reports

### Current Status
- All report components are empty placeholders
- No backend logic

### Database Views/Queries Required

All reports will query from existing tables:
- `Account`
- `JournalEntry`
- `JournalEntryLine`
- `SalesOrder`
- `PurchaseOrder`

### Backend Implementation Strategy

#### Step 5.1: Create ReportService Interface
**File:** `src/main/java/com/example/GinumApps/service/ReportService.java`

```java
public interface ReportService {
    GeneralLedgerDto getGeneralLedger(Integer companyId, LocalDate startDate, LocalDate endDate);
    TrialBalanceDto getTrialBalance(Integer companyId, LocalDate asOfDate);
    IncomeStatementDto getIncomeStatement(Integer companyId, LocalDate startDate, LocalDate endDate);
    BalanceSheetDto getBalanceSheet(Integer companyId, LocalDate asOfDate);
    CashflowStatementDto getCashflowStatement(Integer companyId, LocalDate startDate, LocalDate endDate);
}
```

---

### 5.A. General Ledger Report

#### Step 5.2: Create DTOs
```java
@Data
public class GeneralLedgerDto {
    private List<AccountLedgerDto> accounts;
    private LocalDate startDate;
    private LocalDate endDate;
}

@Data
public class AccountLedgerDto {
    private Integer accountId;
    private String accountCode;
    private String accountName;
    private String accountType;
    private Double openingBalance;
    private List<LedgerEntryDto> entries;
    private Double closingBalance;
}

@Data
public class LedgerEntryDto {
    private LocalDate date;
    private String description;
    private String referenceNumber;
    private Double debit;
    private Double credit;
    private Double balance;
}
```

#### Step 5.3: Implement Service Logic

**Query Logic:**
```java
public GeneralLedgerDto getGeneralLedger(Integer companyId, LocalDate startDate, LocalDate endDate) {
    // 1. Get all accounts for the company
    List<Account> accounts = accountRepository.findByCompanyId(companyId);
    
    // 2. For each account, get all journal entry lines within date range
    List<AccountLedgerDto> ledgers = new ArrayList<>();
    
    for (Account account : accounts) {
        AccountLedgerDto ledger = new AccountLedgerDto();
        ledger.setAccountId(account.getId());
        ledger.setAccountCode(account.getAccountCode());
        ledger.setAccountName(account.getAccountName());
        ledger.setAccountType(account.getAccountType().name());
        
        // Calculate opening balance (all entries before startDate)
        Double openingBalance = calculateOpeningBalance(account.getId(), startDate);
        ledger.setOpeningBalance(openingBalance);
        
        // Get entries within date range
        List<JournalEntryLine> lines = journalEntryLineRepository
            .findByAccountIdAndDateBetween(account.getId(), startDate, endDate);
        
        // Build running balance
        Double runningBalance = openingBalance;
        List<LedgerEntryDto> entries = new ArrayList<>();
        
        for (JournalEntryLine line : lines) {
            LedgerEntryDto entry = new LedgerEntryDto();
            entry.setDate(line.getJournalEntry().getTransactionDate());
            entry.setDescription(line.getDescription());
            entry.setReferenceNumber(line.getJournalEntry().getReferenceNumber());
            entry.setDebit(line.getDebitAmount());
            entry.setCredit(line.getCreditAmount());
            
            // Update running balance based on account type
            if (isDebitAccount(account.getAccountType())) {
                runningBalance += line.getDebitAmount() - line.getCreditAmount();
            } else {
                runningBalance += line.getCreditAmount() - line.getDebitAmount();
            }
            
            entry.setBalance(runningBalance);
            entries.add(entry);
        }
        
        ledger.setEntries(entries);
        ledger.setClosingBalance(runningBalance);
        ledgers.add(ledger);
    }
    
    GeneralLedgerDto result = new GeneralLedgerDto();
    result.setAccounts(ledgers);
    result.setStartDate(startDate);
    result.setEndDate(endDate);
    return result;
}
```

#### Step 5.4: Create Controller Endpoint
```java
@GetMapping("/reports/general-ledger")
public ResponseEntity<GeneralLedgerDto> getGeneralLedger(
    @PathVariable Integer companyId,
    @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
    @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
) {
    GeneralLedgerDto report = reportService.getGeneralLedger(companyId, startDate, endDate);
    return ResponseEntity.ok(report);
}
```

#### Step 5.5: Frontend - GeneralLedger.jsx

```javascript
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");
const [ledgerData, setLedgerData] = useState([]);

const fetchGeneralLedger = async () => {
    const companyId = sessionStorage.getItem("companyId");
    const response = await api.get(
        `/api/companies/${companyId}/reports/general-ledger`,
        { params: { startDate, endDate } }
    );
    setLedgerData(response.data.accounts);
};

// Display Format:
// For each account:
//   Account Code | Account Name | Opening Balance
//   Date | Description | Ref | Debit | Credit | Balance
//   ... entries ...
//   Closing Balance
```

---

### 5.B. Trial Balance Report

#### Step 5.6: Create DTOs
```java
@Data
public class TrialBalanceDto {
    private LocalDate asOfDate;
    private List<TrialBalanceLineDto> lines;
    private Double totalDebits;
    private Double totalCredits;
}

@Data
public class TrialBalanceLineDto {
    private String accountCode;
    private String accountName;
    private String accountType;
    private Double debitBalance;
    private Double creditBalance;
}
```

#### Step 5.7: Implement Service Logic

**Query Logic:**
```java
public TrialBalanceDto getTrialBalance(Integer companyId, LocalDate asOfDate) {
    // 1. Get all accounts
    List<Account> accounts = accountRepository.findByCompanyId(companyId);
    
    // 2. Calculate balance for each account up to asOfDate
    List<TrialBalanceLineDto> lines = new ArrayList<>();
    Double totalDebits = 0.0;
    Double totalCredits = 0.0;
    
    for (Account account : accounts) {
        // Sum all debits and credits for this account up to asOfDate
        Double totalDebit = journalEntryLineRepository
            .sumDebitsByAccountAndDateBefore(account.getId(), asOfDate);
        Double totalCredit = journalEntryLineRepository
            .sumCreditsByAccountAndDateBefore(account.getId(), asOfDate);
        
        Double balance = totalDebit - totalCredit;
        
        TrialBalanceLineDto line = new TrialBalanceLineDto();
        line.setAccountCode(account.getAccountCode());
        line.setAccountName(account.getAccountName());
        line.setAccountType(account.getAccountType().name());
        
        // Determine if balance is debit or credit based on account type
        if (isDebitAccount(account.getAccountType())) {
            if (balance > 0) {
                line.setDebitBalance(balance);
                totalDebits += balance;
            } else {
                line.setCreditBalance(Math.abs(balance));
                totalCredits += Math.abs(balance);
            }
        } else {
            if (balance < 0) {
                line.setDebitBalance(Math.abs(balance));
                totalDebits += Math.abs(balance);
            } else {
                line.setCreditBalance(balance);
                totalCredits += balance;
            }
        }
        
        lines.add(line);
    }
    
    TrialBalanceDto result = new TrialBalanceDto();
    result.setAsOfDate(asOfDate);
    result.setLines(lines);
    result.setTotalDebits(totalDebits);
    result.setTotalCredits(totalCredits);
    return result;
}

private boolean isDebitAccount(AccountType type) {
    return type == AccountType.ASSET || type == AccountType.EXPENSE;
}
```

#### Step 5.8: Frontend - TrialBalance.jsx

```javascript
const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
const [trialBalance, setTrialBalance] = useState(null);

const fetchTrialBalance = async () => {
    const companyId = sessionStorage.getItem("companyId");
    const response = await api.get(
        `/api/companies/${companyId}/reports/trial-balance`,
        { params: { asOfDate } }
    );
    setTrialBalance(response.data);
};

// Display:
// Account Code | Account Name | Debit | Credit
// ... lines ...
// Total | {totalDebits} | {totalCredits}
// Note: Totals must match! If not, there's an entry error.
```

---

### 5.C. Income Statement (Profit & Loss)

#### Step 5.9: Create DTOs
```java
@Data
public class IncomeStatementDto {
    private LocalDate startDate;
    private LocalDate endDate;
    
    // Revenue Section
    private List<AccountBalanceDto> revenueAccounts;
    private Double totalRevenue;
    
    // Cost of Goods Sold
    private List<AccountBalanceDto> cogsAccounts;
    private Double totalCOGS;
    private Double grossProfit; // Revenue - COGS
    
    // Operating Expenses
    private List<AccountBalanceDto> operatingExpenses;
    private Double totalOperatingExpenses;
    private Double operatingIncome; // Gross Profit - Operating Expenses
    
    // Other Income/Expenses
    private List<AccountBalanceDto> otherIncome;
    private List<AccountBalanceDto> otherExpenses;
    private Double totalOtherIncome;
    private Double totalOtherExpenses;
    
    // Net Profit
    private Double netProfit; // Operating Income + Other Income - Other Expenses
}

@Data
public class AccountBalanceDto {
    private String accountCode;
    private String accountName;
    private Double balance;
}
```

#### Step 5.10: Implement Service Logic

```java
public IncomeStatementDto getIncomeStatement(Integer companyId, LocalDate startDate, LocalDate endDate) {
    IncomeStatementDto dto = new IncomeStatementDto();
    dto.setStartDate(startDate);
    dto.setEndDate(endDate);
    
    // Get all income accounts
    List<Account> incomeAccounts = accountRepository
        .findByCompanyIdAndAccountType(companyId, AccountType.INCOME);
    
    List<AccountBalanceDto> revenueList = new ArrayList<>();
    Double totalRevenue = 0.0;
    
    for (Account account : incomeAccounts) {
        Double balance = calculateAccountBalance(account.getId(), startDate, endDate);
        if (balance != 0) {
            AccountBalanceDto ab = new AccountBalanceDto();
            ab.setAccountCode(account.getAccountCode());
            ab.setAccountName(account.getAccountName());
            ab.setBalance(Math.abs(balance)); // Credit balance, show as positive
            revenueList.add(ab);
            totalRevenue += Math.abs(balance);
        }
    }
    dto.setRevenueAccounts(revenueList);
    dto.setTotalRevenue(totalRevenue);
    
    // Get COGS accounts (subtype of EXPENSE)
    List<Account> cogsAccounts = accountRepository
        .findByCompanyIdAndAccountSubType(companyId, "COST_OF_GOODS_SOLD");
    
    List<AccountBalanceDto> cogsList = new ArrayList<>();
    Double totalCOGS = 0.0;
    
    for (Account account : cogsAccounts) {
        Double balance = calculateAccountBalance(account.getId(), startDate, endDate);
        if (balance != 0) {
            AccountBalanceDto ab = new AccountBalanceDto();
            ab.setAccountCode(account.getAccountCode());
            ab.setAccountName(account.getAccountName());
            ab.setBalance(Math.abs(balance));
            cogsList.add(ab);
            totalCOGS += Math.abs(balance);
        }
    }
    dto.setCogsAccounts(cogsList);
    dto.setTotalCOGS(totalCOGS);
    
    // Gross Profit
    dto.setGrossProfit(totalRevenue - totalCOGS);
    
    // Operating Expenses
    List<Account> expenseAccounts = accountRepository
        .findByCompanyIdAndAccountType(companyId, AccountType.EXPENSE);
    
    // Exclude COGS
    expenseAccounts = expenseAccounts.stream()
        .filter(a -> !a.getAccountSubType().equals("COST_OF_GOODS_SOLD"))
        .collect(Collectors.toList());
    
    List<AccountBalanceDto> expenseList = new ArrayList<>();
    Double totalExpenses = 0.0;
    
    for (Account account : expenseAccounts) {
        Double balance = calculateAccountBalance(account.getId(), startDate, endDate);
        if (balance != 0) {
            AccountBalanceDto ab = new AccountBalanceDto();
            ab.setAccountCode(account.getAccountCode());
            ab.setAccountName(account.getAccountName());
            ab.setBalance(Math.abs(balance));
            expenseList.add(ab);
            totalExpenses += Math.abs(balance);
        }
    }
    dto.setOperatingExpenses(expenseList);
    dto.setTotalOperatingExpenses(totalExpenses);
    
    // Operating Income
    dto.setOperatingIncome(dto.getGrossProfit() - totalExpenses);
    
    // Net Profit (simplified, can add other income/expenses later)
    dto.setNetProfit(dto.getOperatingIncome());
    
    return dto;
}

private Double calculateAccountBalance(Integer accountId, LocalDate startDate, LocalDate endDate) {
    Double debits = journalEntryLineRepository
        .sumDebitsByAccountAndDateBetween(accountId, startDate, endDate);
    Double credits = journalEntryLineRepository
        .sumCreditsByAccountAndDateBetween(accountId, startDate, endDate);
    return (debits != null ? debits : 0.0) - (credits != null ? credits : 0.0);
}
```

#### Step 5.11: Frontend - IncomeStatement.jsx

```javascript
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");
const [incomeStatement, setIncomeStatement] = useState(null);

const fetchIncomeStatement = async () => {
    const companyId = sessionStorage.getItem("companyId");
    const response = await api.get(
        `/api/companies/${companyId}/reports/income-statement`,
        { params: { startDate, endDate } }
    );
    setIncomeStatement(response.data);
};

// Display Format:
// INCOME STATEMENT
// For Period: {startDate} to {endDate}
//
// Revenue:
//   Sales Revenue         $10,000
//   Service Revenue       $5,000
//   Total Revenue                   $15,000
//
// Cost of Goods Sold:
//   Cost of Materials     $3,000
//   Total COGS                      $3,000
//
// Gross Profit                      $12,000
//
// Operating Expenses:
//   Salaries              $5,000
//   Rent                  $2,000
//   Total Operating Expenses        $7,000
//
// Operating Income                  $5,000
//
// NET PROFIT                        $5,000
```

---

### 5.D. Balance Sheet

#### Step 5.12: Create DTOs
```java
@Data
public class BalanceSheetDto {
    private LocalDate asOfDate;
    
    // Assets
    private List<AccountBalanceDto> currentAssets;
    private Double totalCurrentAssets;
    private List<AccountBalanceDto> fixedAssets;
    private Double totalFixedAssets;
    private Double totalAssets;
    
    // Liabilities
    private List<AccountBalanceDto> currentLiabilities;
    private Double totalCurrentLiabilities;
    private List<AccountBalanceDto> longTermLiabilities;
    private Double totalLongTermLiabilities;
    private Double totalLiabilities;
    
    // Equity
    private List<AccountBalanceDto> equityAccounts;
    private Double totalEquity;
    private Double retainedEarnings; // From Income Statement
    
    // Total Liabilities + Equity (must equal Total Assets)
    private Double totalLiabilitiesAndEquity;
}
```

#### Step 5.13: Implement Service Logic

```java
public BalanceSheetDto getBalanceSheet(Integer companyId, LocalDate asOfDate) {
    BalanceSheetDto dto = new BalanceSheetDto();
    dto.setAsOfDate(asOfDate);
    
    // ASSETS
    List<Account> assetAccounts = accountRepository
        .findByCompanyIdAndAccountType(companyId, AccountType.ASSET);
    
    List<AccountBalanceDto> currentAssets = new ArrayList<>();
    List<AccountBalanceDto> fixedAssets = new ArrayList<>();
    Double totalCurrentAssets = 0.0;
    Double totalFixedAssets = 0.0;
    
    for (Account account : assetAccounts) {
        Double balance = calculateBalanceUpTo(account.getId(), asOfDate);
        if (balance != 0) {
            AccountBalanceDto ab = new AccountBalanceDto();
            ab.setAccountCode(account.getAccountCode());
            ab.setAccountName(account.getAccountName());
            ab.setBalance(balance);
            
            // Classify as current or fixed (based on subtype or account code)
            if (isCurrentAsset(account)) {
                currentAssets.add(ab);
                totalCurrentAssets += balance;
            } else {
                fixedAssets.add(ab);
                totalFixedAssets += balance;
            }
        }
    }
    dto.setCurrentAssets(currentAssets);
    dto.setTotalCurrentAssets(totalCurrentAssets);
    dto.setFixedAssets(fixedAssets);
    dto.setTotalFixedAssets(totalFixedAssets);
    dto.setTotalAssets(totalCurrentAssets + totalFixedAssets);
    
    // LIABILITIES
    List<Account> liabilityAccounts = accountRepository
        .findByCompanyIdAndAccountType(companyId, AccountType.LIABILITY);
    
    List<AccountBalanceDto> currentLiabilities = new ArrayList<>();
    List<AccountBalanceDto> longTermLiabilities = new ArrayList<>();
    Double totalCurrentLiabilities = 0.0;
    Double totalLongTermLiabilities = 0.0;
    
    for (Account account : liabilityAccounts) {
        Double balance = calculateBalanceUpTo(account.getId(), asOfDate);
        balance = Math.abs(balance); // Liabilities are credit, show as positive
        
        if (balance != 0) {
            AccountBalanceDto ab = new AccountBalanceDto();
            ab.setAccountCode(account.getAccountCode());
            ab.setAccountName(account.getAccountName());
            ab.setBalance(balance);
            
            if (isCurrentLiability(account)) {
                currentLiabilities.add(ab);
                totalCurrentLiabilities += balance;
            } else {
                longTermLiabilities.add(ab);
                totalLongTermLiabilities += balance;
            }
        }
    }
    dto.setCurrentLiabilities(currentLiabilities);
    dto.setTotalCurrentLiabilities(totalCurrentLiabilities);
    dto.setLongTermLiabilities(longTermLiabilities);
    dto.setTotalLongTermLiabilities(totalLongTermLiabilities);
    dto.setTotalLiabilities(totalCurrentLiabilities + totalLongTermLiabilities);
    
    // EQUITY
    List<Account> equityAccounts = accountRepository
        .findByCompanyIdAndAccountType(companyId, AccountType.EQUITY);
    
    List<AccountBalanceDto> equity = new ArrayList<>();
    Double totalEquity = 0.0;
    
    for (Account account : equityAccounts) {
        Double balance = calculateBalanceUpTo(account.getId(), asOfDate);
        balance = Math.abs(balance);
        
        if (balance != 0) {
            AccountBalanceDto ab = new AccountBalanceDto();
            ab.setAccountCode(account.getAccountCode());
            ab.setAccountName(account.getAccountName());
            ab.setBalance(balance);
            equity.add(ab);
            totalEquity += balance;
        }
    }
    
    // Add Retained Earnings (Net Profit from Income Statement)
    IncomeStatementDto income = getIncomeStatement(companyId, 
        LocalDate.of(asOfDate.getYear(), 1, 1), asOfDate);
    Double retainedEarnings = income.getNetProfit();
    
    dto.setEquityAccounts(equity);
    dto.setRetainedEarnings(retainedEarnings);
    dto.setTotalEquity(totalEquity + retainedEarnings);
    
    dto.setTotalLiabilitiesAndEquity(dto.getTotalLiabilities() + dto.getTotalEquity());
    
    return dto;
}
```

#### Step 5.14: Frontend - BalanceSheet.jsx

```javascript
// Display Format:
// BALANCE SHEET
// As of {asOfDate}
//
// ASSETS
// Current Assets:
//   Cash                  $10,000
//   Accounts Receivable   $5,000
//   Total Current Assets            $15,000
//
// Fixed Assets:
//   Equipment             $20,000
//   Total Fixed Assets              $20,000
//
// TOTAL ASSETS                      $35,000
//
// LIABILITIES & EQUITY
// Current Liabilities:
//   Accounts Payable      $3,000
//   Total Current Liabilities       $3,000
//
// Long-Term Liabilities:
//   Loan Payable          $10,000
//   Total Long-Term Liabilities     $10,000
//
// Total Liabilities                 $13,000
//
// Equity:
//   Owner's Equity        $20,000
//   Retained Earnings     $2,000
//   Total Equity                    $22,000
//
// TOTAL LIABILITIES & EQUITY        $35,000
//
// Note: Total Assets MUST equal Total Liabilities & Equity
```

---

### 5.E. Cashflow Statement

#### Step 5.15: Create DTOs
```java
@Data
public class CashflowStatementDto {
    private LocalDate startDate;
    private LocalDate endDate;
    
    // Operating Activities
    private List<CashflowLineDto> operatingActivities;
    private Double netCashFromOperating;
    
    // Investing Activities
    private List<CashflowLineDto> investingActivities;
    private Double netCashFromInvesting;
    
    // Financing Activities
    private List<CashflowLineDto> financingActivities;
    private Double netCashFromFinancing;
    
    // Net Change in Cash
    private Double netChangeInCash;
    private Double beginningCash;
    private Double endingCash;
}

@Data
public class CashflowLineDto {
    private String description;
    private Double amount;
}
```

#### Step 5.16: Implement Service Logic

```java
public CashflowStatementDto getCashflowStatement(Integer companyId, LocalDate startDate, LocalDate endDate) {
    CashflowStatementDto dto = new CashflowStatementDto();
    dto.setStartDate(startDate);
    dto.setEndDate(endDate);
    
    // This is a simplified indirect method approach
    
    // OPERATING ACTIVITIES
    List<CashflowLineDto> operating = new ArrayList<>();
    
    // Start with Net Income
    IncomeStatementDto income = getIncomeStatement(companyId, startDate, endDate);
    CashflowLineDto netIncome = new CashflowLineDto();
    netIncome.setDescription("Net Income");
    netIncome.setAmount(income.getNetProfit());
    operating.add(netIncome);
    
    // Add back non-cash expenses (depreciation, etc.)
    // Get change in accounts receivable
    // Get change in accounts payable
    // Get change in inventory
    // (Simplified - would need to calculate these)
    
    dto.setOperatingActivities(operating);
    dto.setNetCashFromOperating(income.getNetProfit()); // Simplified
    
    // INVESTING ACTIVITIES
    List<CashflowLineDto> investing = new ArrayList<>();
    // Purchase of equipment
    // Sale of assets
    // (Would query Fixed Asset purchases/sales)
    dto.setInvestingActivities(investing);
    dto.setNetCashFromInvesting(0.0);
    
    // FINANCING ACTIVITIES
    List<CashflowLineDto> financing = new ArrayList<>();
    // Loan proceeds
    // Loan repayments
    // Owner contributions/withdrawals
    dto.setFinancingActivities(financing);
    dto.setNetCashFromFinancing(0.0);
    
    // Net Change
    Double netChange = dto.getNetCashFromOperating() + 
                      dto.getNetCashFromInvesting() + 
                      dto.getNetCashFromFinancing();
    dto.setNetChangeInCash(netChange);
    
    // Beginning and Ending Cash
    Double beginningCash = getCashBalance(companyId, startDate);
    Double endingCash = beginningCash + netChange;
    dto.setBeginningCash(beginningCash);
    dto.setEndingCash(endingCash);
    
    return dto;
}

private Double getCashBalance(Integer companyId, LocalDate asOfDate) {
    // Query all ASSET_BANK and ASSET_CASH accounts
    List<Account> cashAccounts = accountRepository
        .findByCompanyIdAndAccountTypeIn(companyId, 
            Arrays.asList(AccountType.ASSET_BANK, AccountType.ASSET_CASH));
    
    Double total = 0.0;
    for (Account account : cashAccounts) {
        total += calculateBalanceUpTo(account.getId(), asOfDate);
    }
    return total;
}
```

#### Step 5.17: Frontend - Cashflow.jsx

```javascript
// Similar structure to Income Statement
// Display operating, investing, financing sections
// Show net change in cash
```

---

## 6. Payroll System

### Current Status
- Completely empty component
- No backend support

### Database Tables Required

#### Step 6.1: Create PayPeriod Entity
```java
@Entity
public class PayPeriod {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    private Company company;
    
    private LocalDate periodStart;
    private LocalDate periodEnd;
    
    @Enumerated(EnumType.STRING)
    private PayPeriodFrequency frequency; // WEEKLY, BI_WEEKLY, MONTHLY
    
    @Enumerated(EnumType.STRING)
    private PayPeriodStatus status; // DRAFT, PROCESSING, PAID, CLOSED
    
    @OneToMany(mappedBy = "payPeriod")
    private List<Payslip> payslips;
    
    private Double totalGrossPay;
    private Double totalDeductions;
    private Double totalNetPay;
    
    private LocalDate payDate;
    private LocalDateTime processedAt;
}
```

#### Step 6.2: Create Payslip Entity
```java
@Entity
public class Payslip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    private PayPeriod payPeriod;
    
    @ManyToOne
    private Employee employee;
    
    private String payslipNumber; // PAY-2025-001-0001
    
    // Earnings
    private Double basicSalary;
    private Double overtimeHours;
    private Double overtimeRate;
    private Double overtimePay;
    private Double allowances; // Transport, meal, etc.
    private Double bonuses;
    private Double grossPay;
    
    // Deductions
    private Double taxDeduction;
    private Double epfDeduction; // Employee Provident Fund
    private Double loanDeduction;
    private Double otherDeductions;
    private Double totalDeductions;
    
    // Net Pay
    private Double netPay;
    
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus; // PENDING, PAID
    
    private LocalDateTime paidAt;
    private String paymentMethod; // BANK_TRANSFER, CASH, CHEQUE
    private String paymentReference;
}
```

#### Step 6.3: Update Employee Entity
Add payroll-related fields to Employee:
```java
private Double monthlySalary; // or hourlyRate
private Double hourlyRate;
@Enumerated(EnumType.STRING)
private EmploymentType employmentType; // FULL_TIME, PART_TIME, CONTRACT
private String bankAccountNumber;
private String bankName;
```

### Backend Implementation

#### Step 6.4: Create Service
**File:** `src/main/java/com/example/GinumApps/service/PayrollService.java`

**Key Methods:**
1. **createPayPeriod** - Define new pay period (start date, end date, frequency)
2. **generatePayslips** - Auto-generate payslips for all employees in the period
3. **updatePayslip** - Manually adjust individual payslip (overtime, bonuses, deductions)
4. **processPayroll** - Mark payroll as processed, create journal entries
5. **markAsPaid** - Mark individual payslips as paid
6. **getPayrollReport** - Summary of pay period

**Payslip Calculation Logic:**
```java
private Payslip generatePayslipForEmployee(Employee employee, PayPeriod period) {
    Payslip payslip = new Payslip();
    payslip.setPayPeriod(period);
    payslip.setEmployee(employee);
    
    // Calculate Basic Salary
    Double basicSalary = 0.0;
    if (employee.getEmploymentType() == EmploymentType.FULL_TIME) {
        // For monthly salary, pro-rate if partial period
        basicSalary = employee.getMonthlySalary();
    } else if (employee.getEmploymentType() == EmploymentType.PART_TIME) {
        // Calculate based on hourly rate and hours worked
        // (Would need attendance/timesheet data)
        basicSalary = employee.getHourlyRate() * getWorkedHours(employee, period);
    }
    payslip.setBasicSalary(basicSalary);
    
    // Overtime (if applicable)
    Double overtimeHours = getOvertimeHours(employee, period);
    Double overtimeRate = employee.getHourlyRate() * 1.5; // 1.5x for overtime
    Double overtimePay = overtimeHours * overtimeRate;
    payslip.setOvertimeHours(overtimeHours);
    payslip.setOvertimeRate(overtimeRate);
    payslip.setOvertimePay(overtimePay);
    
    // Allowances (configurable per employee)
    Double allowances = getEmployeeAllowances(employee);
    payslip.setAllowances(allowances);
    
    // Bonuses (if any for this period)
    Double bonuses = 0.0;
    payslip.setBonuses(bonuses);
    
    // Gross Pay
    Double grossPay = basicSalary + overtimePay + allowances + bonuses;
    payslip.setGrossPay(grossPay);
    
    // Deductions
    // Tax (simplified - use tax bracket calculation)
    Double taxDeduction = calculateTax(grossPay);
    payslip.setTaxDeduction(taxDeduction);
    
    // EPF (e.g., 8% of basic salary)
    Double epfDeduction = basicSalary * 0.08;
    payslip.setEpfDeduction(epfDeduction);
    
    // Loan repayment (if any active loans for employee)
    Double loanDeduction = getEmployeeLoanDeduction(employee);
    payslip.setLoanDeduction(loanDeduction);
    
    // Other deductions
    Double otherDeductions = 0.0;
    payslip.setOtherDeductions(otherDeductions);
    
    // Total Deductions
    Double totalDeductions = taxDeduction + epfDeduction + loanDeduction + otherDeductions;
    payslip.setTotalDeductions(totalDeductions);
    
    // Net Pay
    Double netPay = grossPay - totalDeductions;
    payslip.setNetPay(netPay);
    
    // Generate payslip number
    String payslipNumber = generatePayslipNumber(period, employee);
    payslip.setPayslipNumber(payslipNumber);
    
    payslip.setPaymentStatus(PaymentStatus.PENDING);
    
    return payslip;
}

private Double calculateTax(Double grossPay) {
    // Simplified tax calculation
    // Example: 0% up to $1000, 10% from $1000-$5000, 20% above $5000
    if (grossPay <= 1000) return 0.0;
    if (grossPay <= 5000) return (grossPay - 1000) * 0.10;
    return (4000 * 0.10) + ((grossPay - 5000) * 0.20);
}
```

**Journal Entry Creation:**
```java
public void processPayroll(Integer payPeriodId) {
    PayPeriod period = payPeriodRepository.findById(payPeriodId);
    
    // Create Journal Entry for Payroll
    JournalEntry entry = new JournalEntry();
    entry.setCompany(period.getCompany());
    entry.setTransactionDate(period.getPayDate());
    entry.setReferenceNumber("PAYROLL-" + period.getId());
    entry.setDescription("Payroll for period " + period.getPeriodStart() + " to " + period.getPeriodEnd());
    
    // Debit: Salary Expense
    JournalEntryLine expenseLine = new JournalEntryLine();
    expenseLine.setAccount(getSalaryExpenseAccount());
    expenseLine.setDebitAmount(period.getTotalGrossPay());
    expenseLine.setCreditAmount(0.0);
    entry.getLines().add(expenseLine);
    
    // Credit: Salaries Payable (Liability)
    JournalEntryLine liabilityLine = new JournalEntryLine();
    liabilityLine.setAccount(getSalariesPayableAccount());
    liabilityLine.setDebitAmount(0.0);
    liabilityLine.setCreditAmount(period.getTotalNetPay());
    entry.getLines().add(liabilityLine);
    
    // Credit: Tax Payable (for withheld taxes)
    JournalEntryLine taxLine = new JournalEntryLine();
    taxLine.setAccount(getTaxPayableAccount());
    taxLine.setDebitAmount(0.0);
    taxLine.setCreditAmount(period.getTotalDeductions());
    entry.getLines().add(taxLine);
    
    journalEntryRepository.save(entry);
    
    period.setStatus(PayPeriodStatus.PROCESSING);
    period.setProcessedAt(LocalDateTime.now());
    payPeriodRepository.save(period);
}
```

#### Step 6.5: Create Controller
```java
@RestController
@RequestMapping("/api/companies/{companyId}/payroll")
public class PayrollController {
    
    @PostMapping("/periods")
    public ResponseEntity<PayPeriod> createPayPeriod(
        @PathVariable Integer companyId,
        @RequestBody PayPeriodRequestDto request
    );
    
    @GetMapping("/periods")
    public ResponseEntity<List<PayPeriod>> getAllPayPeriods(
        @PathVariable Integer companyId
    );
    
    @PostMapping("/periods/{periodId}/generate-payslips")
    public ResponseEntity<?> generatePayslips(
        @PathVariable Integer periodId
    );
    
    @GetMapping("/periods/{periodId}/payslips")
    public ResponseEntity<List<Payslip>> getPayslips(
        @PathVariable Integer periodId
    );
    
    @PutMapping("/payslips/{payslipId}")
    public ResponseEntity<Payslip> updatePayslip(
        @PathVariable Integer payslipId,
        @RequestBody PayslipUpdateDto request
    );
    
    @PostMapping("/periods/{periodId}/process")
    public ResponseEntity<?> processPayroll(
        @PathVariable Integer periodId
    );
    
    @PostMapping("/payslips/{payslipId}/mark-paid")
    public ResponseEntity<?> markAsPaid(
        @PathVariable Integer payslipId,
        @RequestBody PaymentDetailsDto payment
    );
}
```

### Frontend Implementation

#### Step 6.6: Implement CreatePayroll.jsx

**Features:**
1. **Create Pay Period:**
   - Select frequency (Weekly, Bi-Weekly, Monthly)
   - Select start date, end date
   - Select pay date

2. **Generate Payslips:**
   - Click "Generate Payslips" button
   - System automatically creates payslips for all employees

3. **View & Edit Payslips:**
   - Display table of all employees
   - Show: Employee Name, Basic Salary, Overtime, Allowances, Gross Pay, Deductions, Net Pay
   - Allow editing of overtime hours, bonuses, deductions
   - Update individual payslip

4. **Process Payroll:**
   - Review totals
   - Click "Process Payroll" to create journal entries
   - Status changes to PROCESSING

5. **Mark as Paid:**
   - Select payment method (Bank Transfer, Cash, Cheque)
   - Enter payment reference
   - Mark individual or all payslips as paid

**UI Structure:**
```javascript
const [payPeriods, setPayPeriods] = useState([]);
const [currentPeriod, setCurrentPeriod] = useState(null);
const [payslips, setPayslips] = useState([]);

const createNewPeriod = async () => {
    const payload = {
        periodStart: startDate,
        periodEnd: endDate,
        frequency: 'MONTHLY',
        payDate: payDate
    };
    
    const response = await api.post(
        `/api/companies/${companyId}/payroll/periods`,
        payload
    );
    setCurrentPeriod(response.data);
};

const generatePayslips = async () => {
    await api.post(
        `/api/companies/${companyId}/payroll/periods/${currentPeriod.id}/generate-payslips`
    );
    fetchPayslips();
};

const updatePayslip = async (payslipId, updates) => {
    await api.put(
        `/api/companies/${companyId}/payroll/payslips/${payslipId}`,
        updates
    );
    fetchPayslips();
};

const processPayroll = async () => {
    await api.post(
        `/api/companies/${companyId}/payroll/periods/${currentPeriod.id}/process`
    );
    Alert.success("Payroll processed successfully!");
};
```

---

## 7. Advanced Inventory Features

### Current Status
- Basic inventory UI exists with hardcoded data
- No real tracking of stock movements

### Database Tables Required

#### Step 7.1: Create StockMovement Entity
```java
@Entity
public class StockMovement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    private Company company;
    
    @ManyToOne
    private Item item;
    
    @Enumerated(EnumType.STRING)
    private MovementType movementType; // IN, OUT, ADJUSTMENT
    
    @Enumerated(EnumType.STRING)
    private MovementReason reason; // PURCHASE, SALE, RETURN, ADJUSTMENT, DAMAGE, THEFT
    
    private Double quantity;
    private Double unitCost;
    
    private LocalDate movementDate;
    
    private Integer referenceId; // Purchase Order ID, Sales Order ID, etc.
    private String referenceType; // PURCHASE_ORDER, SALES_ORDER, ADJUSTMENT
    
    private String notes;
    
    @ManyToOne
    private AppUser createdBy;
    
    private LocalDateTime createdAt;
}
```

#### Step 7.2: Update Item Entity
Add inventory tracking fields:
```java
private Double currentStock; // Current quantity on hand
private Double reorderLevel; // Alert when stock falls below this
private Double reorderQuantity; // Suggested reorder amount
private String storageLocation;
private String binNumber;

@Enumerated(EnumType.STRING)
private StockValuationMethod valuationMethod; // FIFO, LIFO, WEIGHTED_AVERAGE
```

### Backend Implementation

#### Step 7.3: Create Inventory Service
**File:** `src/main/java/com/example/GinumApps/service/InventoryService.java`

**Key Methods:**
1. **recordStockIn** - Increase stock (from purchase)
2. **recordStockOut** - Decrease stock (from sale)
3. **adjustStock** - Manual adjustment
4. **getStockMovements** - History of all movements for an item
5. **getLowStockItems** - Items below reorder level
6. **getStockValuation** - Total inventory value
7. **getItemHistory** - All transactions for an item

**Stock Movement Logic:**
```java
public void recordStockIn(Integer itemId, Double quantity, Double unitCost, 
                          Integer purchaseOrderId) {
    Item item = itemRepository.findById(itemId);
    
    // Create stock movement record
    StockMovement movement = new StockMovement();
    movement.setItem(item);
    movement.setMovementType(MovementType.IN);
    movement.setReason(MovementReason.PURCHASE);
    movement.setQuantity(quantity);
    movement.setUnitCost(unitCost);
    movement.setMovementDate(LocalDate.now());
    movement.setReferenceId(purchaseOrderId);
    movement.setReferenceType("PURCHASE_ORDER");
    stockMovementRepository.save(movement);
    
    // Update item current stock
    item.setCurrentStock(item.getCurrentStock() + quantity);
    itemRepository.save(item);
}

public void recordStockOut(Integer itemId, Double quantity, Integer salesOrderId) {
    Item item = itemRepository.findById(itemId);
    
    // Check if sufficient stock
    if (item.getCurrentStock() < quantity) {
        throw new InsufficientStockException("Not enough stock for item: " + item.getItemName());
    }
    
    // Calculate cost based on valuation method
    Double unitCost = calculateUnitCost(item);
    
    // Create stock movement record
    StockMovement movement = new StockMovement();
    movement.setItem(item);
    movement.setMovementType(MovementType.OUT);
    movement.setReason(MovementReason.SALE);
    movement.setQuantity(quantity);
    movement.setUnitCost(unitCost);
    movement.setMovementDate(LocalDate.now());
    movement.setReferenceId(salesOrderId);
    movement.setReferenceType("SALES_ORDER");
    stockMovementRepository.save(movement);
    
    // Update item current stock
    item.setCurrentStock(item.getCurrentStock() - quantity);
    itemRepository.save(item);
    
    // Check reorder level
    if (item.getCurrentStock() <= item.getReorderLevel()) {
        createLowStockAlert(item);
    }
}

private Double calculateUnitCost(Item item) {
    // Implement based on valuation method
    if (item.getValuationMethod() == StockValuationMethod.FIFO) {
        // Get oldest stock first
        return getFIFOCost(item.getId());
    } else if (item.getValuationMethod() == StockValuationMethod.WEIGHTED_AVERAGE) {
        // Calculate weighted average
        return getWeightedAverageCost(item.getId());
    }
    return item.getPurchasePrice();
}
```

#### Step 7.4: Integration with Sales & Purchases

**When Purchase Order is completed:**
```java
// In PurchaseOrderService
public void completePurchaseOrder(Integer purchaseOrderId) {
    PurchaseOrder po = purchaseOrderRepository.findById(purchaseOrderId);
    
    // For each line item, record stock in
    for (PurchaseOrderLineItem lineItem : po.getLineItems()) {
        inventoryService.recordStockIn(
            lineItem.getItem().getId(),
            lineItem.getQuantity(),
            lineItem.getUnitPrice(),
            purchaseOrderId
        );
    }
    
    po.setStatus(PurchaseOrderStatus.COMPLETED);
    purchaseOrderRepository.save(po);
}
```

**When Sales Order is created:**
```java
// In SalesOrderService
public SalesOrder createSalesOrder(SalesOrderRequestDto request) {
    // Validate stock availability
    for (LineItemDto lineItem : request.getLineItems()) {
        Item item = itemRepository.findById(lineItem.getItemId());
        if (item.getCurrentStock() < lineItem.getQuantity()) {
            throw new InsufficientStockException("Insufficient stock for: " + item.getItemName());
        }
    }
    
    // Create sales order
    SalesOrder salesOrder = new SalesOrder();
    // ... set fields ...
    salesOrder = salesOrderRepository.save(salesOrder);
    
    // Record stock out
    for (SalesOrderLineItem lineItem : salesOrder.getLineItems()) {
        inventoryService.recordStockOut(
            lineItem.getItem().getId(),
            lineItem.getQuantity(),
            salesOrder.getId()
        );
    }
    
    return salesOrder;
}
```

#### Step 7.5: Create Controller Endpoints
```java
@RestController
@RequestMapping("/api/companies/{companyId}/inventory")
public class InventoryController {
    
    @PostMapping("/items/{itemId}/adjust")
    public ResponseEntity<?> adjustStock(
        @PathVariable Integer itemId,
        @RequestBody StockAdjustmentDto adjustment
    );
    
    @GetMapping("/items/{itemId}/movements")
    public ResponseEntity<List<StockMovement>> getStockMovements(
        @PathVariable Integer itemId
    );
    
    @GetMapping("/low-stock")
    public ResponseEntity<List<Item>> getLowStockItems(
        @PathVariable Integer companyId
    );
    
    @GetMapping("/valuation")
    public ResponseEntity<StockValuationDto> getStockValuation(
        @PathVariable Integer companyId
    );
}
```

### Frontend Implementation

#### Step 7.6: Update InventoryDashboard.jsx

Replace hardcoded data with real API integration:

1. **Fetch Items from API:**
```javascript
const fetchItems = async () => {
    const companyId = sessionStorage.getItem("companyId");
    const response = await api.get(`/api/companies/${companyId}/items`);
    setItems(response.data);
};
```

2. **Add Stock (From Purchase):**
```javascript
const handleAddStock = async (itemId, quantity) => {
    const payload = {
        movementType: 'IN',
        reason: 'ADJUSTMENT',
        quantity: parseFloat(quantity),
        notes: notes
    };
    
    await api.post(
        `/api/companies/${companyId}/inventory/items/${itemId}/adjust`,
        payload
    );
    
    Alert.success("Stock added successfully!");
    fetchItems();
};
```

3. **Reduce Stock (Manual Adjustment):**
```javascript
const handleReduceStock = async (itemId, quantity) => {
    const payload = {
        movementType: 'OUT',
        reason: 'ADJUSTMENT',
        quantity: parseFloat(quantity),
        notes: notes
    };
    
    await api.post(
        `/api/companies/${companyId}/inventory/items/${itemId}/adjust`,
        payload
    );
    
    Alert.success("Stock reduced successfully!");
    fetchItems();
};
```

4. **View Stock Movements:**
```javascript
const viewMovements = async (itemId) => {
    const response = await api.get(
        `/api/companies/${companyId}/inventory/items/${itemId}/movements`
    );
    setMovements(response.data);
    setMovementsModalOpen(true);
};
```

5. **Low Stock Alerts:**
```javascript
const fetchLowStockItems = async () => {
    const response = await api.get(
        `/api/companies/${companyId}/inventory/low-stock`
    );
    setLowStockItems(response.data);
    
    if (response.data.length > 0) {
        Alert.warning(`${response.data.length} items are low in stock!`);
    }
};
```

6. **Display Stock Valuation:**
```javascript
const fetchStockValuation = async () => {
    const response = await api.get(
        `/api/companies/${companyId}/inventory/valuation`
    );
    setValuation(response.data);
};

// Display:
// Total Inventory Value: ${valuation.totalValue}
// Items in Stock: {valuation.itemCount}
// Low Stock Items: {valuation.lowStockCount}
```

---

## Testing & Validation Checklist

### For Each Module

1. **Backend Testing:**
   - [ ] Create unit tests for service layer
   - [ ] Test repository queries
   - [ ] Test DTOs and validation
   - [ ] Test controller endpoints with Postman/Swagger
   - [ ] Verify database transactions (rollback on error)
   - [ ] Test edge cases (null values, invalid data)

2. **Frontend Testing:**
   - [ ] Test form validation
   - [ ] Test API integration
   - [ ] Test error handling and user feedback
   - [ ] Test loading states
   - [ ] Test with real vs mock data
   - [ ] Cross-browser compatibility

3. **Integration Testing:**
   - [ ] Test full user workflow
   - [ ] Verify data consistency across modules
   - [ ] Test with multiple concurrent users
   - [ ] Verify JWT token expiration handling

4. **Business Logic Validation:**
   - [ ] Verify accounting rules (debits = credits)
   - [ ] Verify calculations (totals, taxes, discounts)
   - [ ] Verify status workflows
   - [ ] Verify permission checks

---

## Deployment Considerations

### Before Production Deployment

1. **Security:**
   - [ ] Enable HTTPS
   - [ ] Set strong JWT secret key
   - [ ] Enable CSRF protection
   - [ ] Implement rate limiting
   - [ ] Add input sanitization
   - [ ] Review CORS settings

2. **Database:**
   - [ ] Change `hibernate.ddl-auto` to `validate` (NOT `update`)
   - [ ] Create database backup strategy
   - [ ] Add database indexes for performance
   - [ ] Set up connection pooling

3. **Performance:**
   - [ ] Add caching (Redis) for frequently accessed data
   - [ ] Optimize database queries (use join fetch)
   - [ ] Implement pagination for large data sets
   - [ ] Minify and compress frontend assets
   - [ ] Enable Gzip compression

4. **Monitoring:**
   - [ ] Add logging (SLF4J + Logback)
   - [ ] Set up error tracking (Sentry)
   - [ ] Add application metrics
   - [ ] Configure health check endpoints

5. **Documentation:**
   - [ ] Update API documentation (Swagger)
   - [ ] Create user manual
   - [ ] Document deployment process
   - [ ] Create troubleshooting guide

---

## Implementation Timeline Estimate

**Assuming 1 developer working full-time:**

| Module | Estimated Time |
|--------|----------------|
| Dashboard Analytics | 3-5 days |
| Money Transactions | 5-7 days |
| Bank Reconciliation | 4-6 days |
| Quotations Module | 5-7 days |
| General Ledger Report | 3-4 days |
| Trial Balance Report | 2-3 days |
| Income Statement | 4-5 days |
| Balance Sheet | 4-5 days |
| Cashflow Statement | 5-6 days |
| Payroll System | 10-14 days |
| Advanced Inventory | 7-10 days |

**Total: ~52-72 days (approximately 2.5-3.5 months)**

---

## Additional Enhancements (Future)

1. **Multi-Currency Support**
2. **Email Notifications** (Quotations, Payslips)
3. **PDF Generation** (Invoices, Reports)
4. **Audit Trail** (Track all changes)
5. **User Permissions** (Fine-grained access control)
6. **Mobile App** (React Native)
7. **API for Third-Party Integrations**
8. **Automated Backups**
9. **Two-Factor Authentication**
10. **Advanced Analytics Dashboard** (Charts, KPIs)

---

## Contact & Support

For any questions during implementation:
- Review existing code patterns in the project
- Check Spring Boot and React documentation
- Use Swagger UI for API testing
- Test incrementally - don't build everything at once

**Good luck with the implementation! 🚀**
