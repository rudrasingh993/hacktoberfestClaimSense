# ClaimSense 3-Minute Live Demonstration Script
Event: Hacktoberfest 2026 • Pune × NIAT-ADYPU Hack Day

## Minute 0:00 - 0:45: The Problem & The ₹63,000 Out-of-Pocket Shock
1. **Open Dashboard (`/`)**:
   - Point out the headline: *"Know your hospital bill before hospital admission."*
   - Highlight the local status pill showing **Ollama: gemma4:e4b** connected on loopback without cloud exposure.
2. **Explain the ₹63,000 Case**:
   - Show the primary illustrative scenario: An ₹8,000/day single room vs. ₹5,000/day policy limit.
   - Explain how proportionate deduction penalizes ₹1,20,000 of surgeon & OT fees by 37.5%, turning an ₹1,44,000 bill into a ₹63,000 family out-of-pocket burden.

## Minute 0:45 - 1:30: Running the Core Estimate & Trace
1. **Click "Try ₹63,000 Demo Scenario"**:
   - Navigates to `/estimate/review`.
   - Point out the confirmation gate: The user must explicitly check the confirmation box.
2. **Click "Confirm & Calculate Claim Estimate"**:
   - Triggers the deterministic Python calculation engine.
   - On the Results page (`/results/:id`), show the exact match:
     - Total bill: **₹1,44,000**
     - Insurer payment: **₹81,000**
     - Family payment: **₹63,000**
3. **Expand "Show Your Work"**:
   - Demonstrate the complete 8-step auditable trace showing exact formulas, ratios (0.625), and policy clauses.
4. **Switch Languages**:
   - Click **हिंदी** and **मराठी** to demonstrate plain-language explanations with preserved numerical values.

## Minute 1:30 - 2:15: Interactive Room Tariff Comparison
1. **Click "Compare Room Categories" (`/compare`)**:
   - Show the side-by-side comparison across General Ward, Semi-Private, Single Room, and Deluxe Suite.
   - Highlight the visual Bar Chart.
   - Point out the recommendation: **Twin Sharing (Semi-Private)** saves **₹49,650** out-of-pocket because the ₹4,500 rate sits within the ₹5,000 limit!

## Minute 2:15 - 2:45: AI Document Upload & Multimodal Extraction
1. **Navigate to Upload (`/estimate/upload`)**:
   - Click *"Load Sample Bill Image"* to load the synthetic estimate `data/sample_hospital_bill.png`.
   - Click *"Extract Candidate Fields"*.
   - Show candidate extraction of hospital name, room rate (₹8,000), stay (3 days), and OT charges by local Gemma 4.
   - Note that values remain unconfirmed until reviewed by the user.

## Minute 2:45 - 3:00: Security & Verification Lab
1. **Open Security Lab (`/security`)**:
   - Click **Prompt Injection Defense** → Show live backend response blocking system instruction hijacking.
   - Click **Fabricated Tool Call** → Show Gate 1 rejecting `execute_arbitrary_refund()`.
   - Click **Run Live Verification Suite** → Executes `check_all.py` live in 0.1s, displaying:
     **"ClaimSense Verification Suite: 9 / 9 seeded checks passed"**.
