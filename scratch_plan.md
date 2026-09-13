# Ideas for Implementation
- Rename "Tasa de Basura" to "Basura"
- Rename "Internet Residencial" to "Tigo Internet"
- Add `period` (varchar) to `fixed_payments` (e.g., "2026-09")
- Add `type` (varchar) to `fixed_payments` (e.g., "fixed", "variable")
- Create `AddVariablePaymentModal` with inputs for: Service (Dropdown: Electricidad, Gasolina, Supermercado), Amount, Period.
- Calculate accumulated unpaid amounts in the frontend by grouping by Service.
