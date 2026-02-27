package com.example.GinumApps.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/companies/{companyId}/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    // Gets the financial dashboard statistics for a specific company
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getCompanyDashboardStats(@PathVariable Integer companyId) {
        Map<String, Object> stats = new HashMap<>();

        // TODO: Later calculate these dynamically using Accounts/Transactions from the
        // database
        stats.put("revenue", 0.0);
        stats.put("prevRevenue", 0.0);

        stats.put("expenses", 0.0);
        stats.put("prevExpenses", 0.0);

        stats.put("profit", 0.0);
        stats.put("prevProfit", 0.0);

        // Send empty arrays for the charts for now as they don't have historical data
        // yet
        stats.put("recentTransactions", new Object[] {});
        stats.put("topClients", new Object[] {});

        return ResponseEntity.ok(stats);
    }
}
