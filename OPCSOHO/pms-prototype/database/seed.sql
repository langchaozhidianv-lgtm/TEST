USE pms_prototype;

INSERT INTO projects
  (id, project_code, name, contract_no, project_type, business_type, customer_name, division_name, project_manager, status, start_date, planned_end_date, shipped_amount, collected_amount, contract_amount, description)
VALUES
  (1, 'XM-2026-018', 'Project 1', 'HT-2026-018', 'COLD_STORAGE', 'INSTALLATION', 'Customer 1', 'Division 1', 'Manager 1', 'DELAYED', '2026-01-15', '2026-05-18', 18200000.00, 12600000.00, 24600000.00, 'Description 1'),
  (2, 'XM-2026-021', 'Project 2', 'HT-2026-021', 'BUILDING', 'EPC', 'Customer 2', 'Division 2', 'Manager 2', 'IN_PROGRESS', '2026-02-01', '2026-06-30', 9300000.00, 6400000.00, 16800000.00, 'Description 2');

INSERT INTO project_documents (project_id, doc_type, file_name, uploaded_by, is_required) VALUES
  (1, 'CONTRACT', 'sales-contract-018.pdf', 'Staff 1', 1),
  (1, 'SAFETY_DISCLOSURE', 'safety-disclosure-018.pdf', 'Staff 2', 1),
  (1, 'ACCEPTANCE_FORM', 'acceptance-template-018.pdf', 'Staff 3', 1),
  (2, 'CONTRACT', 'sales-contract-021.pdf', 'Staff 1', 1),
  (2, 'SAFETY_DISCLOSURE', 'safety-disclosure-021.pdf', 'Staff 2', 1);

INSERT INTO contracts
  (id, project_id, contract_code, contract_type, contract_name, counterparty_name, amount, tax_rate, payment_terms, collection_stages, actual_collection_amount, signed_date, status)
VALUES
  (1, 1, 'SC-018-01', 'SALES', 'Contract 1', 'Counterparty 1', 24600000.00, 13.00, 'Terms 1', '预付款\n发货款\n验收款\n质保金', 4920000.00, '2026-01-10', 'EXECUTING'),
  (2, 1, 'PC-018-01', 'PROCUREMENT', 'Contract 2', 'Counterparty 2', 5600000.00, 13.00, 'Terms 2', NULL, 0.00, '2026-01-18', 'EXECUTING'),
  (3, 2, 'SC-021-01', 'SALES', 'Contract 3', 'Counterparty 3', 16800000.00, 9.00, 'Terms 3', '预付款\n发货款\n调试款\n质保金', 2520000.00, '2026-01-28', 'EXECUTING'),
  (4, 2, 'LC-021-01', 'LABOR', 'Contract 4', 'Counterparty 4', 3300000.00, 3.00, 'Terms 4', NULL, 0.00, '2026-02-08', 'EXECUTING'),
  (5, 1, 'LC-018-02', 'LABOR', 'Contract 5', 'Counterparty 5', 1860000.00, 3.00, 'Terms 5', NULL, 0.00, '2026-02-15', 'EXECUTING'),
  (6, 2, 'LC-021-02', 'LABOR', 'Contract 6', 'Counterparty 6', 2140000.00, 3.00, 'Terms 6', NULL, 0.00, '2026-03-03', 'APPROVED');

INSERT INTO cost_entries
  (project_id, contract_id, version_type, cost_category, amount, entry_date, source_ref, notes)
VALUES
  (1, 1, 'SIGNED', 'MAIN_MATERIAL', 8200000.00, '2026-01-10', 'SIGNED-018-1', 'Note 1'),
  (1, 1, 'SIGNED', 'LABOR', 2800000.00, '2026-01-10', 'SIGNED-018-2', 'Note 2'),
  (1, 1, 'SIGNED', 'EXPENSE', 1200000.00, '2026-01-10', 'SIGNED-018-3', 'Note 3'),
  (1, 1, 'BUDGET', 'MAIN_MATERIAL', 8600000.00, '2026-01-20', 'BUDGET-018-1', 'Note 4'),
  (1, 1, 'BUDGET', 'LABOR', 3100000.00, '2026-01-20', 'BUDGET-018-2', 'Note 5'),
  (1, 1, 'BUDGET', 'EXPENSE', 1380000.00, '2026-01-20', 'BUDGET-018-3', 'Note 6'),
  (1, 2, 'ACTUAL', 'MAIN_MATERIAL', 9100000.00, '2026-03-15', 'PO-8821', 'Note 7'),
  (1, NULL, 'ACTUAL', 'LABOR', 3520000.00, '2026-03-20', 'LAB-018-03', 'Note 8'),
  (1, NULL, 'ACTUAL', 'EXPENSE', 1520000.00, '2026-03-22', 'EXP-018-01', 'Note 9'),
  (2, 3, 'SIGNED', 'MAIN_MATERIAL', 5100000.00, '2026-01-28', 'SIGNED-021-1', 'Note 1'),
  (2, 3, 'SIGNED', 'LABOR', 2300000.00, '2026-01-28', 'SIGNED-021-2', 'Note 2'),
  (2, 3, 'BUDGET', 'MAIN_MATERIAL', 5600000.00, '2026-02-05', 'BUDGET-021-1', 'Note 4'),
  (2, 3, 'BUDGET', 'LABOR', 2500000.00, '2026-02-05', 'BUDGET-021-2', 'Note 5'),
  (2, 4, 'ACTUAL', 'LABOR', 1730000.00, '2026-03-18', 'LAB-021-02', 'Note 10'),
  (2, NULL, 'ACTUAL', 'MAIN_MATERIAL', 4820000.00, '2026-03-16', 'MAT-021-01', 'Note 11');

INSERT INTO remaining_materials
  (project_id, material_name, specification, quantity, unit, estimated_value, status, disposal_notes)
VALUES
  (1, 'Material 1', '100mm', 120.00, 'sqm', 58000.00, 'REUSABLE', 'Note 1'),
  (2, 'Material 2', 'Q235', 36.00, 'pcs', 12000.00, 'TO_BE_SCRAPPED', 'Note 2');

INSERT INTO finance_transactions
  (project_id, contract_id, transaction_type, direction, collection_stage, amount, due_date, transaction_date, status, vendor_name, applicant, notes)
VALUES
  (1, 1, 'COLLECTION_PLAN', 'INCOME', '预付款', 4920000.00, '2026-01-20', NULL, 'APPROVED', 'Vendor 1', 'Applicant 1', 'Finance Note 1'),
  (1, 1, 'COLLECTION', 'INCOME', '预付款', 4920000.00, '2026-01-20', '2026-01-22', 'PAID', 'Vendor 1', 'Applicant 2', 'Finance Note 2'),
  (1, 2, 'PREPAYMENT', 'EXPENSE', NULL, 1680000.00, '2026-01-25', '2026-01-26', 'PAID', 'Vendor 2', 'Applicant 3', 'Finance Note 3'),
  (1, 2, 'PAYMENT_PLAN', 'EXPENSE', NULL, 2240000.00, '2026-03-30', NULL, 'PENDING', 'Vendor 2', 'Applicant 3', 'Finance Note 4'),
  (1, NULL, 'WAGE_DISBURSEMENT', 'EXPENSE', NULL, 460000.00, '2026-03-25', '2026-03-25', 'PAID', 'Vendor 3', 'Applicant 4', 'Finance Note 5'),
  (2, 3, 'COLLECTION_PLAN', 'INCOME', '预付款', 2520000.00, '2026-02-10', NULL, 'APPROVED', 'Vendor 4', 'Applicant 1', 'Finance Note 1'),
  (2, 3, 'COLLECTION', 'INCOME', '预付款', 2520000.00, '2026-02-10', '2026-02-12', 'PAID', 'Vendor 4', 'Applicant 2', 'Finance Note 2'),
  (2, 4, 'PAYMENT_REQUEST', 'EXPENSE', NULL, 680000.00, '2026-03-28', NULL, 'PENDING', 'Vendor 5', 'Applicant 5', 'Finance Note 6');

INSERT INTO site_records
  (project_id, record_type, title, vendor_or_team, status, planned_date, actual_date, amount, quantity, unit, details)
VALUES
  (1, 'PROCUREMENT', 'Record 1', 'Vendor A', 'IN_PROGRESS', '2026-03-10', NULL, 5600000.00, 20.00, 'sets', 'Detail 1'),
  (1, 'SHIPPING', 'Record 2', 'Vendor A', 'DELAYED', '2026-03-18', NULL, 3200000.00, 8.00, 'sets', 'Detail 2'),
  (1, 'LABOR', 'Record 3', 'Team A', 'COMPLETED', '2026-03-25', '2026-03-25', 460000.00, 128.00, 'man-day', 'Detail 3'),
  (1, 'SAFETY', 'Record 4', 'Dept A', 'COMPLETED', '2026-02-05', '2026-02-05', 0.00, 1.00, 'time', 'Detail 4'),
  (2, 'PROCUREMENT', 'Record 5', 'Vendor B', 'COMPLETED', '2026-03-05', '2026-03-07', 2260000.00, 5200.00, 'sqm', 'Detail 5'),
  (2, 'SHIPPING', 'Record 6', 'Vendor C', 'IN_PROGRESS', '2026-03-26', NULL, 1800000.00, 42.00, 'sets', 'Detail 6'),
  (2, 'ACCEPTANCE', 'Record 7', 'Unit A', 'PENDING_CONFIRM', '2026-03-29', NULL, 0.00, 1.00, 'time', 'Detail 7');

INSERT INTO budget_adjustments
  (project_id, request_type, requested_amount, budget_amount, actual_expense_amount, status, reason)
VALUES
  (1, 'PAYMENT', 450000.00, 13080000.00, 12880000.00, 'PENDING', 'Budget reason');

UPDATE projects SET
  name = CONVERT(0xe58d97e4baace58cbbe88dafe586b7e5ba93e4ba8ce69c9fe9a1b9e79bae USING utf8mb4),
  customer_name = CONVERT(0xe58d97e4baace58cbbe88dafe586b7e993bee69c89e99990e585ace58fb8 USING utf8mb4),
  division_name = CONVERT(0xe5b7a5e7a88be4ba8be4b89ae983a8 USING utf8mb4),
  project_manager = CONVERT(0xe591a8e6b5b7e6b48b USING utf8mb4),
  description = CONVERT(0xe586b7e5ba93e4ba8ce69c9fe689a9e5bbbae58f8ae5ae89e8a385e5b7a5e7a88b USING utf8mb4)
WHERE id = 1;

UPDATE projects SET
  name = CONVERT(0xe88b8fe5b79ee9a39fe59381e59bade58cbae4bf9de6b8a9e9a1b9e79bae USING utf8mb4),
  customer_name = CONVERT(0xe88b8fe5b79ee699b6e6ba90e9a39fe59381e7a791e68a80e69c89e99990e585ace58fb8 USING utf8mb4),
  division_name = CONVERT(0xe5bbbae7ad91e4ba8be4b89ae983a8 USING utf8mb4),
  project_manager = CONVERT(0xe9a1bee4ba91e9a39e USING utf8mb4),
  description = CONVERT(0xe9a39fe59381e59bade58cbae4bf9de6b8a9e58f8ae9858de5a597e5bbbae8aebee5b7a5e7a88b USING utf8mb4)
WHERE id = 2;

UPDATE project_documents SET uploaded_by = CONVERT(0xe99480e594aee58685e58ba4 USING utf8mb4) WHERE id IN (1, 4);
UPDATE project_documents SET uploaded_by = CONVERT(0xe5ae89e585a8e4b8bbe7aea1 USING utf8mb4) WHERE id IN (2, 5);
UPDATE project_documents SET uploaded_by = CONVERT(0xe9a1b9e79baee7bb8fe79086 USING utf8mb4) WHERE id = 3;

UPDATE contracts SET
  contract_name = CONVERT(0xe58d97e4baace58cbbe88dafe586b7e5ba93e99480e594aee59088e5908c USING utf8mb4),
  counterparty_name = CONVERT(0xe58d97e4baace58cbbe88dafe586b7e993bee69c89e99990e585ace58fb8 USING utf8mb4),
  payment_terms = CONVERT(0xe9a284e4bb98e6acbe333025efbc8ce8bf9be5baa6e6acbe353025efbc8ce7bb93e7ae97e6acbe323025efbc8ce8b4a8e4bf9de98791313025 USING utf8mb4)
WHERE id = 1;

UPDATE contracts SET
  contract_name = CONVERT(0xe586b7e9a38ee69cbae98787e8b4ade59088e5908c USING utf8mb4),
  counterparty_name = CONVERT(0xe5b8b8e5b79ee586b7e69cbae8aebee5a487e69c89e99990e585ace58fb8 USING utf8mb4),
  payment_terms = CONVERT(0xe9a284e4bb98333025efbc8ce588b0e8b4a7343025efbc8ce9aa8ce694b6333025 USING utf8mb4)
WHERE id = 2;

UPDATE contracts SET
  contract_name = CONVERT(0xe88b8fe5b79ee9a39fe59381e59bade58cba455043e59088e5908c USING utf8mb4),
  counterparty_name = CONVERT(0xe88b8fe5b79ee699b6e6ba90e9a39fe59381e7a791e68a80e69c89e99990e585ace58fb8 USING utf8mb4),
  payment_terms = CONVERT(0xe9a284e4bb98e6acbe313525efbc8ce88a82e782b9e6acbe353525efbc8ce7bb93e7ae97e6acbe323025efbc8ce8b4a8e4bf9de98791313025 USING utf8mb4)
WHERE id = 3;

UPDATE contracts SET
  contract_name = CONVERT(0xe59c9fe5bbbae58ab3e58aa1e58886e58c85e59088e5908c USING utf8mb4),
  counterparty_name = CONVERT(0xe88b8fe5b79ce8bf9ce68b93e58ab3e58aa1e69c89e99990e585ace58fb8 USING utf8mb4),
  payment_terms = CONVERT(0xe68c89e69c88e8aea1e9878fe694afe4bb98 USING utf8mb4)
WHERE id = 4;

UPDATE contracts SET
  contract_name = CONVERT(0xe586b7e5ba93e4bf9de6b8a9e983a8e58886e58ab3e58aa1e59088e5908c USING utf8mb4),
  counterparty_name = CONVERT(0xe58d97e4baace5ae89e7ad91e58ab3e58aa1e69c89e99990e585ace58fb8 USING utf8mb4),
  payment_terms = CONVERT(0xe68c89e69c88e5ae8ce68890e5b7a5e9878fe6a0b8e7ae97efbc8ce6acbee588b0e8b4a63135e697a5e58685e694afe4bb98 USING utf8mb4)
WHERE id = 5;

UPDATE contracts SET
  contract_name = CONVERT(0xe4bf9de6b8a9e5ae89e8a385e78fade7bb84e58ab3e58aa1e59088e5908c USING utf8mb4),
  counterparty_name = CONVERT(0xe88f8fe5b79ee5ae89e585a8e5b7a5e7a88be58ab3e58aa1e69c89e99990e585ace58fb8 USING utf8mb4),
  payment_terms = CONVERT(0xe69c88e5baa6e88083e58ba4e5908ee6aca1e69c8835e697a5e5898de694afe4bb98 USING utf8mb4)
WHERE id = 6;

UPDATE cost_entries SET notes = CONVERT(0xe7adbee7baa6e4b8bbe69d90e68890e69cac USING utf8mb4) WHERE id IN (1, 10);
UPDATE cost_entries SET notes = CONVERT(0xe7adbee7baa6e58ab3e58aa1e68890e69cac USING utf8mb4) WHERE id IN (2, 11);
UPDATE cost_entries SET notes = CONVERT(0xe7adbee7baa6e8b4b9e794a8e68890e69cac USING utf8mb4) WHERE id = 3;
UPDATE cost_entries SET notes = CONVERT(0xe9a284e7ae97e4b8bbe69d90 USING utf8mb4) WHERE id IN (4, 12);
UPDATE cost_entries SET notes = CONVERT(0xe9a284e7ae97e58ab3e58aa1 USING utf8mb4) WHERE id IN (5, 13);
UPDATE cost_entries SET notes = CONVERT(0xe9a284e7ae97e8b4b9e794a8 USING utf8mb4) WHERE id = 6;
UPDATE cost_entries SET notes = CONVERT(0xe586b7e9a38ee69cbae98787e8b4ade585a5e8b4a6 USING utf8mb4) WHERE id = 7;
UPDATE cost_entries SET notes = CONVERT(0xe5ae89e8a385e78fade7bb84e4babae5b7a5e8b4b9 USING utf8mb4) WHERE id = 8;
UPDATE cost_entries SET notes = CONVERT(0xe78eb0e59cbae7aea1e79086e8b4b9e794a8 USING utf8mb4) WHERE id = 9;
UPDATE cost_entries SET notes = CONVERT(0xe59c9fe5bbbae58ab3e58aa1e5ae9ee99985e68890e69cac USING utf8mb4) WHERE id = 14;
UPDATE cost_entries SET notes = CONVERT(0xe4bf9de6b8a9e69d90e69699e5ae9ee99985e68890e69cac USING utf8mb4) WHERE id = 15;

UPDATE remaining_materials SET
  material_name = CONVERT(0xe8819ae6b0a8e985afe4bf9de6b8a9e69dbfe5b0bee69699 USING utf8mb4),
  disposal_notes = CONVERT(0xe58fafe8bdace585a5e585b6e4bb96e586b7e5ba93e9a1b9e79baee7bba7e7bbade4bdbfe794a8 USING utf8mb4)
WHERE id = 1;

UPDATE remaining_materials SET
  material_name = CONVERT(0xe997a8e6a186e59e8be69d90e4bd99e69699 USING utf8mb4),
  disposal_notes = CONVERT(0xe5be85e6a0b8e99480e5908ee8bf9be8a18ce68aa5e5ba9fe5a484e79086 USING utf8mb4)
WHERE id = 2;

UPDATE finance_transactions SET
  vendor_name = CONVERT(0xe58d97e4baace58cbbe88dafe586b7e993bee69c89e99990e585ace58fb8 USING utf8mb4),
  applicant = CONVERT(0xe99480e594aee58685e58ba4 USING utf8mb4),
  notes = CONVERT(0xe9a284e4bb98e6acbee694b6e6acbee8aea1e58892 USING utf8mb4)
WHERE id = 1;

UPDATE finance_transactions SET
  vendor_name = CONVERT(0xe58d97e4baace58cbbe88dafe586b7e993bee69c89e99990e585ace58fb8 USING utf8mb4),
  applicant = CONVERT(0xe8b4a2e58aa1e4b893e59198 USING utf8mb4),
  notes = CONVERT(0xe9a284e4bb98e6acbee5b7b2e588b0e8b4a6 USING utf8mb4)
WHERE id = 2;

UPDATE finance_transactions SET
  vendor_name = CONVERT(0xe5b8b8e5b79ee586b7e69cbae8aebee5a487e69c89e99990e585ace58fb8 USING utf8mb4),
  applicant = CONVERT(0xe98787e8b4ade7bb8fe79086 USING utf8mb4),
  notes = CONVERT(0xe8aebee5a487e9a284e4bb98e6acbee694afe4bb98 USING utf8mb4)
WHERE id = 3;

UPDATE finance_transactions SET
  vendor_name = CONVERT(0xe5b8b8e5b79ee586b7e69cbae8aebee5a487e69c89e99990e585ace58fb8 USING utf8mb4),
  applicant = CONVERT(0xe98787e8b4ade7bb8fe79086 USING utf8mb4),
  notes = CONVERT(0xe588b0e8b4a7e6acbee4bb98e6acbee8aea1e58892 USING utf8mb4)
WHERE id = 4;

UPDATE finance_transactions SET
  vendor_name = CONVERT(0xe5ae89e8a385e4b880e78fade7bb84 USING utf8mb4),
  applicant = CONVERT(0xe58ab3e58aa1e4b893e59198 USING utf8mb4),
  notes = CONVERT(0xe5869ce6b091e5b7a5e5b7a5e8b584e4bba3e58f91e5ae8ce68890 USING utf8mb4)
WHERE id = 5;

UPDATE finance_transactions SET
  vendor_name = CONVERT(0xe88b8fe5b79ee699b6e6ba90e9a39fe59381e7a791e68a80e69c89e99990e585ace58fb8 USING utf8mb4),
  applicant = CONVERT(0xe99480e594aee58685e58ba4 USING utf8mb4),
  notes = CONVERT(0xe9a284e4bb98e6acbee694b6e6acbee8aea1e58892 USING utf8mb4)
WHERE id = 6;

UPDATE finance_transactions SET
  vendor_name = CONVERT(0xe88b8fe5b79ee699b6e6ba90e9a39fe59381e7a791e68a80e69c89e99990e585ace58fb8 USING utf8mb4),
  applicant = CONVERT(0xe8b4a2e58aa1e4b893e59198 USING utf8mb4),
  notes = CONVERT(0xe9a284e4bb98e6acbee5b7b2e588b0e8b4a6 USING utf8mb4)
WHERE id = 7;

UPDATE finance_transactions SET
  vendor_name = CONVERT(0xe88b8fe5b79ce8bf9ce68b93e58ab3e58aa1e69c89e99990e585ace58fb8 USING utf8mb4),
  applicant = CONVERT(0xe9a1b9e79baee7bb8fe79086 USING utf8mb4),
  notes = CONVERT(0x33e69c88e58ab3e58aa1e8bf9be5baa6e6acbee794b3e8afb7 USING utf8mb4)
WHERE id = 8;

UPDATE site_records SET
  title = CONVERT(0xe586b7e9a38ee69cbae98787e8b4ade689a7e8a18c USING utf8mb4),
  vendor_or_team = CONVERT(0xe5b8b8e5b79ee586b7e69cbae8aebee5a487e69c89e99990e585ace58fb8 USING utf8mb4),
  details = CONVERT(0xe8aebee5a487e7949fe4baa7e5ae8ce68890e7baa6383025efbc8ce5be85e5ae89e68e92e58f91e8bf90 USING utf8mb4)
WHERE id = 1;

UPDATE site_records SET
  title = CONVERT(0xe586b7e9a38ee69cbae9a696e689b9e58f91e8bf90 USING utf8mb4),
  vendor_or_team = CONVERT(0xe5b8b8e5b79ee586b7e69cbae8aebee5a487e69c89e99990e585ace58fb8 USING utf8mb4),
  details = CONVERT(0xe58f97e789a9e6b581e5bdb1e5938de587bae78eb0e5bbb6e69c9f USING utf8mb4)
WHERE id = 2;

UPDATE site_records SET
  title = CONVERT(0xe5ae89e8a385e4b880e78fade7bb84e88083e58ba4e6b187e680bb USING utf8mb4),
  vendor_or_team = CONVERT(0xe5ae89e8a385e4b880e78fade7bb84 USING utf8mb4),
  details = CONVERT(0xe5b7a5e8b584e4bba3e58f91e5b7b2e5ae8ce68890 USING utf8mb4)
WHERE id = 3;

UPDATE site_records SET
  title = CONVERT(0xe4b889e7baa7e5ae89e585a8e4baa4e5ba95 USING utf8mb4),
  vendor_or_team = CONVERT(0xe9a1b9e79baee5ae89e585a8e983a8 USING utf8mb4),
  details = CONVERT(0xe4baa4e5ba95e8b584e69699e5b7b2e4b88ae4bca0e5bd92e6a1a3 USING utf8mb4)
WHERE id = 4;

UPDATE site_records SET
  title = CONVERT(0xe4bf9de6b8a9e69dbfe98787e8b4ade794b3e8afb7 USING utf8mb4),
  vendor_or_team = CONVERT(0xe88b8fe5b79ee4bf9de6b8a9e69d90e69699e58e82 USING utf8mb4),
  details = CONVERT(0xe69d90e69699e5b7b2e588b0e8b4a7e5b9b6e5ae8ce68890e585a5e5ba93 USING utf8mb4)
WHERE id = 5;

UPDATE site_records SET
  title = CONVERT(0xe997a8e4bd93e69d90e69699e58f91e8bf90 USING utf8mb4),
  vendor_or_team = CONVERT(0xe88b8fe5b79ee997a8e4bd93e588b6e980a0e58e82 USING utf8mb4),
  details = CONVERT(0xe5bd93e5898de5a484e4ba8ee59ca8e98094e8bf90e8be93e78ab6e68081 USING utf8mb4)
WHERE id = 6;

UPDATE site_records SET
  title = CONVERT(0xe59fbae7a180e7bb93e69e84e998b6e6aeb5e9aa8ce694b6 USING utf8mb4),
  vendor_or_team = CONVERT(0xe79b91e79086e58d95e4bd8d USING utf8mb4),
  details = CONVERT(0xe9aa8ce694b6e8b584e69699e5be85e7adbee5ad97e7a1aee8aea4 USING utf8mb4)
WHERE id = 7;

UPDATE budget_adjustments
SET reason = CONVERT(0xe7a4bae4be8befbc9ae4bb98e6acbee794b3e8afb7e5b7b2e68ea5e8bf91e9a284e7ae97e4b88ae99990efbc8ce5be85e58f91e8b5b7e9a284e7ae97e8b083e695b4e5aea1e689b9 USING utf8mb4)
WHERE id = 1;
