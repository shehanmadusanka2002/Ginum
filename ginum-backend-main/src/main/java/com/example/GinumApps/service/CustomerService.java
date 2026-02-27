package com.example.GinumApps.service;

import com.example.GinumApps.dto.CustomerDto;
import com.example.GinumApps.dto.CustomerSummaryDto;
import com.example.GinumApps.model.Company;
import com.example.GinumApps.model.Currency;
import com.example.GinumApps.model.Customer;
import com.example.GinumApps.repository.CompanyRepository;
import com.example.GinumApps.repository.CurrencyRepository;
import com.example.GinumApps.repository.CustomerRepository;
import com.example.GinumApps.exception.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class CustomerService {

        private final CustomerRepository customerRepository;
        private final CompanyRepository companyRepository;
        private final CurrencyRepository currencyRepository;

        @Transactional
        public Customer createCustomer(CustomerDto customerDto) throws IOException {
                // Validate and fetch related entities
                Company company = companyRepository.findById(customerDto.getCompanyId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Company not found with id: " + customerDto.getCompanyId()));

                Currency currency = currencyRepository.findById(customerDto.getCurrencyId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Currency not found with id: " + customerDto.getCurrencyId()));

                // Map DTO to Entity
                Customer customer = new Customer();
                customer.setName(customerDto.getName());
                customer.setPhoneNo(customerDto.getPhoneNo());
                customer.setEmail(customerDto.getEmail());
                customer.setNicNo(customerDto.getNicNo());
                customer.setCustomerType(customerDto.getCustomerType());
                customer.setVat(customerDto.getVat());
                customer.setTinNo(customerDto.getTinNo());
                customer.setDeliveryAddress(customerDto.getDeliveryAddress());
                customer.setTax(customerDto.getTax());
                customer.setBillingAddress(customerDto.getBillingAddress());
                customer.setSwiftNo(customerDto.getSwiftNo());
                customer.setCurrency(currency);
                customer.setDiscountPercentage(customerDto.getDiscountPercentage());
                customer.setCompany(company);

                if (customerDto.getBusinessRegistration() != null
                                && !customerDto.getBusinessRegistration().isEmpty()) {
                        customer.setBusinessRegistration(
                                        customerDto.getBusinessRegistration().getBytes());
                }
                return customerRepository.save(customer);
        }

        public List<CustomerSummaryDto> getCustomersByCompanyId(Integer companyId) {
                companyRepository.findById(companyId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Company not found with id: " + companyId));

                List<Customer> customers = customerRepository.findByCompany_CompanyId(companyId);
                return customers.stream().map(this::convertToSummaryDto).collect(Collectors.toList());
        }

        private CustomerSummaryDto convertToSummaryDto(Customer customer) {
                return CustomerSummaryDto.builder()
                                .id(customer.getId())
                                .name(customer.getName())
                                .email(customer.getEmail())
                                .phoneNo(customer.getPhoneNo())
                                .billingAddress(customer.getBillingAddress())
                                .customerType(customer.getCustomerType())
                                .tax(customer.getTax())
                                .build();
        }
}
