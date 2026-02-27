package com.example.GinumApps.dto;

import com.example.GinumApps.enums.CustomerType;
import com.example.GinumApps.enums.SupplierType;
import com.example.GinumApps.enums.TaxType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CustomerSummaryDto {
    private Long id;
    private String name;
    private String email;
    private String phoneNo;
    private String billingAddress;
    private CustomerType customerType;
    private TaxType tax;
}
