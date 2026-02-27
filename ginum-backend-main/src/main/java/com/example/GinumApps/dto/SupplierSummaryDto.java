package com.example.GinumApps.dto;

import com.example.GinumApps.enums.SupplierType;
import com.example.GinumApps.enums.TaxType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SupplierSummaryDto {
    private String supplierName;
    private String email;
    private String mobileNo;
    private String address;
    private SupplierType supplierType;
    private TaxType tax;
    private String itemCategory;
}
