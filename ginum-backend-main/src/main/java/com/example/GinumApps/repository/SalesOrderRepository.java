package com.example.GinumApps.repository;

import com.example.GinumApps.model.SalesOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {
    // Find the last SO number for a company to auto-increment
    @Query("SELECT MAX(s.soNumber) FROM SalesOrder s WHERE s.company.companyId = :companyId")
    String findLastSoNumberByCompanyId(@Param("companyId") Long companyId);
}
