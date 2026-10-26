# ClaimSense Deterministic Calculation Rules

This document outlines the authoritative sequence and formulas applied by the ClaimSense Python calculation engine.

## Sequence of Calculations

```
1. Total Hospital Bill
   = (room_rate_per_day × room_days) + other_charges + excluded_charges

2. Room Rent Eligibility Ratio
   - If policy room limit type is 'none': ratio = 1.0
   - If room_rate <= policy_limit: ratio = 1.0
   - If room_rate > policy_limit:
       ratio = policy_limit / room_rate

3. Eligible Room Charges
   = min(room_rate, policy_limit) × room_days

4. Proportionate Deduction on Associated Medical Charges
   - If proportionate_deduction_applicable is True and ratio < 1.0:
       adjusted_other_charges = round(other_charges × ratio)
       proportionate_deduction = other_charges - adjusted_other_charges
   - Else:
       adjusted_other_charges = other_charges
       proportionate_deduction = 0

5. Base Admissible Claim
   = eligible_room_charges + adjusted_other_charges

6. Treatment Sub-Limit Capping
   - If base_admissible > treatment_sublimit:
       capped_amount = treatment_sublimit
       sublimit_deduction = base_admissible - treatment_sublimit

7. Deductible Application
   - eligible_after_deductible = max(0, capped_amount - fixed_deductible)

8. Patient Co-Payment
   - copay_deduction = round(eligible_after_deductible × (copay_percentage / 100))
   - insurer_initial = eligible_after_deductible - copay_deduction

9. Available Coverage Cap
   - insurer_final = min(insurer_initial, available_sum_insured)

10. Family Out-of-Pocket Expense
   = total_hospital_bill - insurer_final
```

## Hacktoberfest 2026 Core Case Verification

- Policy Room Limit: ₹5,000 / day
- Selected Room: ₹8,000 / day (Single Private Room)
- Duration: 3 days (Room total: ₹24,000)
- Other Hospital Charges: ₹1,20,000
- Total Hospital Bill: ₹1,44,000
- Eligibility Ratio: ₹5,000 / ₹8,000 = 0.625
- Eligible Room Charges: ₹5,000 × 3 = ₹15,000
- Adjusted Other Charges: ₹1,20,000 × 0.625 = ₹75,000
- Eligible before co-pay: ₹15,000 + ₹75,000 = ₹90,000
- Co-Payment (10%): ₹9,000
- Insurer Payment: ₹81,000
- Family Out-of-Pocket: ₹1,44,000 - ₹81,000 = ₹63,000
