package com.example.GinumApps.controller;

import com.example.GinumApps.dto.CustomerDto;
import com.example.GinumApps.dto.CustomerSummaryDto;
import com.example.GinumApps.model.Customer;
import com.example.GinumApps.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {
    private final CustomerService customerService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Customer> createCustomer(
            @RequestPart("customer") @Valid CustomerDto customerDto,
            @RequestPart(value = "businessRegistration", required = false) MultipartFile file) throws IOException {
            if (file != null && !file.isEmpty()) {
                customerDto.setBusinessRegistration(file);
            }
            Customer createdCustomer = customerService.createCustomer(customerDto);
            return new ResponseEntity<>(createdCustomer, HttpStatus.CREATED);
    }

    @GetMapping("/companies/{companyId}")
    public ResponseEntity<List<CustomerSummaryDto>> getCustomersByCompany(
            @PathVariable Integer companyId) {
        List<CustomerSummaryDto> customers = customerService.getCustomersByCompanyId(companyId);
        return ResponseEntity.ok(customers);
    }
}
