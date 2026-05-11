-- Insert sample templates for all document types

-- 1. Lease Agreement Template - English
INSERT INTO document_templates (name, description, document_type, country_code, template_version, status, content, language, created_by, created_at, updated_at)
VALUES (
    'Standard Lease Agreement - English',
    'Comprehensive residential lease agreement with all standard clauses',
    'LEASE_AGREEMENT',
    'CA',
    1,
    'PUBLISHED',
    '<html>
<head><title>Lease Agreement</title></head>
<body>
<h1>RESIDENTIAL LEASE AGREEMENT</h1>

<p><strong>Landlord:</strong> ${landlordName}</p>
<p><strong>Address:</strong> ${landlordAddress}</p>

<p><strong>Tenant:</strong> ${tenantName}</p>
<p><strong>Address:</strong> ${tenantAddress}</p>

<h2>PREMISES</h2>
<p>Property Address: ${propertyAddress}</p>
<p>Unit Number: ${unitNumber}</p>

<h2>LEASE TERM</h2>
<p><strong>Start Date:</strong> ${startDate}</p>
<p><strong>End Date:</strong> ${endDate}</p>
<p><strong>Length:</strong> ${leaseTerm} months</p>

<h2>RENT TERMS</h2>
<p><strong>Monthly Rent:</strong> $${monthlyRent}</p>
<p><strong>Due Date:</strong> ${rentDueDay}th of each month</p>
<p><strong>Payment Method:</strong> ${paymentMethod}</p>

<h2>DEPOSIT</h2>
<p><strong>Security Deposit:</strong> $${securityDeposit}</p>
<p><strong>Deposit Held:</strong> ${depositHeldBy}</p>

<h2>UTILITIES</h2>
<p>${utilitiesResponsibility}</p>

<h2>BUILDING RULES</h2>
<p>${buildingRules}</p>

<p>By signing below, both parties acknowledge that they have read and understood this lease agreement.</p>

<p>Landlord Signature: __________________ Date: __________</p>
<p>Tenant Signature: __________________ Date: __________</p>
</body>
</html>',
    'EN',
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert template variables for Lease Agreement
INSERT INTO template_variables (template_id, variable_name, display_name, description, data_type, required, default_value, created_at)
VALUES
    ((SELECT id FROM document_templates WHERE name = 'Standard Lease Agreement - English' LIMIT 1), 'landlordName', 'Landlord Name', 'Full name of the landlord', 'STRING', true, NULL, CURRENT_TIMESTAMP),
    ((SELECT id FROM document_templates WHERE name = 'Standard Lease Agreement - English' LIMIT 1), 'landlordAddress', 'Landlord Address', 'Address of the landlord', 'STRING', true, NULL, CURRENT_TIMESTAMP),
    ((SELECT id FROM document_templates WHERE name = 'Standard Lease Agreement - English' LIMIT 1), 'tenantName', 'Tenant Name', 'Full name of the tenant', 'STRING', true, NULL, CURRENT_TIMESTAMP),
    ((SELECT id FROM document_templates WHERE name = 'Standard Lease Agreement - English' LIMIT 1), 'tenantAddress', 'Tenant Address', 'Current address of the tenant', 'STRING', true, NULL, CURRENT_TIMESTAMP),
    ((SELECT id FROM document_templates WHERE name = 'Standard Lease Agreement - English' LIMIT 1), 'propertyAddress', 'Property Address', 'Full address of the rental property', 'STRING', true, NULL, CURRENT_TIMESTAMP),
    ((SELECT id FROM document_templates WHERE name = 'Standard Lease Agreement - English' LIMIT 1), 'unitNumber', 'Unit Number', 'Unit or apartment number', 'STRING', false, NULL, CURRENT_TIMESTAMP),
    ((SELECT id FROM document_templates WHERE name = 'Standard Lease Agreement - English' LIMIT 1), 'startDate', 'Start Date', 'Lease start date (YYYY-MM-DD)', 'DATE', true, NULL, CURRENT_TIMESTAMP),
    ((SELECT id FROM document_templates WHERE name = 'Standard Lease Agreement - English' LIMIT 1), 'endDate', 'End Date', 'Lease end date (YYYY-MM-DD)', 'DATE', true, NULL, CURRENT_TIMESTAMP),
    ((SELECT id FROM document_templates WHERE name = 'Standard Lease Agreement - English' LIMIT 1), 'leaseTerm', 'Lease Term', 'Lease duration in months', 'NUMBER', true, NULL, CURRENT_TIMESTAMP),
    ((SELECT id FROM document_templates WHERE name = 'Standard Lease Agreement - English' LIMIT 1), 'monthlyRent', 'Monthly Rent', 'Monthly rent amount', 'NUMBER', true, NULL, CURRENT_TIMESTAMP),
    ((SELECT id FROM document_templates WHERE name = 'Standard Lease Agreement - English' LIMIT 1), 'rentDueDay', 'Rent Due Day', 'Day of month rent is due (1-31)', 'NUMBER', true, '1', CURRENT_TIMESTAMP),
    ((SELECT id FROM document_templates WHERE name = 'Standard Lease Agreement - English' LIMIT 1), 'paymentMethod', 'Payment Method', 'Method of payment (e.g., bank transfer, check)', 'STRING', true, 'Bank Transfer', CURRENT_TIMESTAMP),
    ((SELECT id FROM document_templates WHERE name = 'Standard Lease Agreement - English' LIMIT 1), 'securityDeposit', 'Security Deposit', 'Amount of security deposit', 'NUMBER', true, NULL, CURRENT_TIMESTAMP),
    ((SELECT id FROM document_templates WHERE name = 'Standard Lease Agreement - English' LIMIT 1), 'depositHeldBy', 'Deposit Held By', 'Who holds the deposit', 'STRING', true, 'Landlord', CURRENT_TIMESTAMP),
    ((SELECT id FROM document_templates WHERE name = 'Standard Lease Agreement - English' LIMIT 1), 'utilitiesResponsibility', 'Utilities Responsibility', 'Who pays for utilities', 'STRING', true, 'Tenant is responsible for all utilities.', CURRENT_TIMESTAMP),
    ((SELECT id FROM document_templates WHERE name = 'Standard Lease Agreement - English' LIMIT 1), 'buildingRules', 'Building Rules', 'Building rules and restrictions', 'STRING', false, 'No smoking. No pets. Quiet hours 10pm-8am.', CURRENT_TIMESTAMP);

-- 2. Lease Renewal Letter - English
INSERT INTO document_templates (name, description, document_type, country_code, template_version, status, content, language, created_by, created_at, updated_at)
VALUES (
    'Lease Renewal Notice - English',
    'Notice to tenant of lease renewal with updated terms',
    'LEASE_RENEWAL',
    'CA',
    1,
    'PUBLISHED',
    '<html>
<head><title>Lease Renewal Notice</title></head>
<body>
<h1>LEASE RENEWAL NOTICE</h1>

<p>${currentDate}</p>

<p><strong>To:</strong> ${tenantName}<br/>
${propertyAddress}<br/>
${tenantCity}, ${tenantProvince} ${tenantPostalCode}</p>

<p><strong>Re: Lease Renewal - ${propertyAddress}</strong></p>

<p>Dear ${tenantName},</p>

<p>This letter is to inform you that your current lease agreement for the above-mentioned property will expire on ${leaseEndDate}.</p>

<p>We would like to offer you the opportunity to renew your lease for an additional ${renewalTerm} months under the following terms:</p>

<ul>
<li><strong>New Lease Start Date:</strong> ${renewalStartDate}</li>
<li><strong>New Lease End Date:</strong> ${renewalEndDate}</li>
<li><strong>New Monthly Rent:</strong> $${newMonthlyRent}</li>
<li><strong>Rent Increase:</strong> ${rentIncreasePercentage}% (from $${currentMonthlyRent})</li>
<li><strong>Security Deposit:</strong> $${newSecurityDeposit}</li>
</ul>

<p>${renewalTerms}</p>

<p>Please respond by ${responseDeadline} to confirm your intention to renew the lease.</p>

<p>Sincerely,</p>

<p>${landlordName}<br/>
${landlordAddress}</p>
</body>
</html>',
    'EN',
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 3. Rent Increase Notice - English
INSERT INTO document_templates (name, description, document_type, country_code, template_version, status, content, language, created_by, created_at, updated_at)
VALUES (
    'Rent Increase Notice - English',
    'Legal notice of rent increase compliant with local regulations',
    'RENT_INCREASE_NOTICE',
    'CA',
    1,
    'PUBLISHED',
    '<html>
<head><title>Rent Increase Notice</title></head>
<body>
<h1>OFFICIAL NOTICE OF RENT INCREASE</h1>

<p>${currentDate}</p>

<p><strong>To:</strong> ${tenantName}<br/>
${propertyAddress}</p>

<p><strong>Re: Official Notice of Rent Increase for ${propertyAddress}</strong></p>

<p>Dear ${tenantName},</p>

<p>This is to formally notify you that effective ${effectiveDate}, your monthly rent will be increased from $${currentRent} to $${newRent}.</p>

<p><strong>Rent Increase Details:</strong></p>
<ul>
<li>Current Rent: $${currentRent}}</li>
<li>New Rent: $${newRent}}</li>
<li>Increase Amount: $${increaseAmount}}</li>
<li>Increase Percentage: ${increasePercentage}%</li>
<li>Effective Date: ${effectiveDate}</li>
<li>Notice Provided: ${daysNotice} days</li>
</ul>

<p><strong>Legal Compliance:</strong></p>
<p>${complianceStatement}</p>

<p>This rent increase complies with applicable provincial rent control guidelines and is provided in accordance with ${regulatoryReference}.</p>

<p>If you have any questions or concerns about this increase, you may contact the Landlord and Tenant Board in your province.</p>

<p>Sincerely,</p>

<p>${landlordName}<br/>
${landlordEmail}<br/>
${landlordPhone}</p>
</body>
</html>',
    'EN',
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 4. Monthly Rent Receipt - English
INSERT INTO document_templates (name, description, document_type, country_code, template_version, status, content, language, created_by, created_at, updated_at)
VALUES (
    'Monthly Rent Receipt - English',
    'Receipt for monthly rent payment',
    'RECEIPT',
    'CA',
    1,
    'PUBLISHED',
    '<html>
<head><title>Rent Receipt</title></head>
<body>
<h1>RENT RECEIPT</h1>

<p><strong>Receipt Date:</strong> ${receiptDate}</p>
<p><strong>Receipt Number:</strong> ${receiptNumber}</p>

<h2>Property Information</h2>
<p><strong>Property Address:</strong> ${propertyAddress}</p>
<p><strong>Unit:</strong> ${unitNumber}</p>

<h2>Tenant Information</h2>
<p><strong>Name:</strong> ${tenantName}</p>
<p><strong>Email:</strong> ${tenantEmail}</p>

<h2>Payment Details</h2>
<p><strong>Payment Period:</strong> ${paymentPeriodStart} to ${paymentPeriodEnd}</p>
<p><strong>Amount Paid:</strong> $${amountPaid}</p>
<p><strong>Payment Method:</strong> ${paymentMethod}</p>
<p><strong>Payment Date:</strong> ${paymentDate}</p>
<p><strong>Transaction ID:</strong> ${transactionId}</p>

<h2>Outstanding Balance</h2>
<p><strong>Total Outstanding:</strong> $${outstandingBalance}</p>

<p>This receipt confirms that the above payment has been received and applied to the rent account.</p>

<p>Thank you for your prompt payment.</p>

<p>${landlordName}<br/>
${landlordSignature}</p>
</body>
</html>',
    'EN',
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 5. Annual Tax Statement - English
INSERT INTO document_templates (name, description, document_type, country_code, template_version, status, content, language, created_by, created_at, updated_at)
VALUES (
    'Annual Tax Statement - English',
    'Annual income and expense summary for tax purposes',
    'TAX_STATEMENT',
    'CA',
    1,
    'PUBLISHED',
    '<html>
<head><title>Annual Tax Statement</title></head>
<body>
<h1>ANNUAL RENTAL INCOME AND EXPENSE STATEMENT</h1>

<p><strong>Tax Year:</strong> ${taxYear}</p>
<p><strong>Statement Date:</strong> ${statementDate}</p>

<h2>Property Information</h2>
<p><strong>Address:</strong> ${propertyAddress}</p>
<p><strong>Municipality:</strong> ${municipality}</p>
<p><strong>Property Type:</strong> ${propertyType}</p>

<h2>Rental Income</h2>
<p><strong>Total Rent Collected:</strong> $${totalRentCollected}</p>
<p><strong>Number of Months Rented:</strong> ${monthsRented}</p>
<p><strong>Vacancy Months:</strong> ${vacancyMonths}</p>
<p><strong>Other Income:</strong> $${otherIncome}</p>
<p><strong>Total Income:</strong> $${totalIncome}</p>

<h2>Expenses</h2>
<p><strong>Mortgage Interest:</strong> $${mortgageInterest}</p>
<p><strong>Property Tax:</strong> $${propertyTax}</p>
<p><strong>Insurance:</strong> $${insurance}</p>
<p><strong>Utilities:</strong> $${utilities}</p>
<p><strong>Maintenance & Repairs:</strong> $${maintenance}</p>
<p><strong>Property Management:</strong> $${propertyManagement}</p>
<p><strong>Advertising & Leasing:</strong> $${advertising}</p>
<p><strong>Other Expenses:</strong> $${otherExpenses}</p>
<p><strong>Total Expenses:</strong> $${totalExpenses}</p>

<h2>Net Income</h2>
<p><strong>Net Rental Income:</strong> $${netRentalIncome}</p>

<p>This statement has been prepared for income tax purposes only.</p>

<p>${landlordName}<br/>
Date: ${statementDate}</p>
</body>
</html>',
    'EN',
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Brazil Portuguese Templates
-- 1. Lease Agreement - Portuguese (Brazil)
INSERT INTO document_templates (name, description, document_type, country_code, template_version, status, content, language, created_by, created_at, updated_at)
VALUES (
    'Contrato de Aluguel - Português',
    'Contrato completo de aluguel residencial com todas as cláusulas padrão',
    'LEASE_AGREEMENT',
    'BR',
    1,
    'PUBLISHED',
    '<html>
<head><meta charset="UTF-8"><title>Contrato de Aluguel</title></head>
<body>
<h1>CONTRATO DE ALUGUEL RESIDENCIAL</h1>

<p><strong>Locador (Proprietário):</strong> ${landlordName}</p>
<p><strong>Endereço:</strong> ${landlordAddress}</p>

<p><strong>Locatário (Inquilino):</strong> ${tenantName}</p>
<p><strong>Endereço:</strong> ${tenantAddress}</p>

<h2>DO IMÓVEL</h2>
<p>Endereço: ${propertyAddress}</p>
<p>Número do Apartamento/Sala: ${unitNumber}</p>

<h2>DO PRAZO</h2>
<p><strong>Data de Início:</strong> ${startDate}</p>
<p><strong>Data de Término:</strong> ${endDate}</p>
<p><strong>Duração:</strong> ${leaseTerm} meses</p>

<h2>DO ALUGUEL</h2>
<p><strong>Aluguel Mensal:</strong> R$ ${monthlyRent}</p>
<p><strong>Dia do Vencimento:</strong> ${rentDueDay} de cada mês</p>
<p><strong>Forma de Pagamento:</strong> ${paymentMethod}</p>

<h2>DA CAUÇÃO</h2>
<p><strong>Valor da Caução:</strong> R$ ${securityDeposit}</p>
<p><strong>Guardada por:</strong> ${depositHeldBy}</p>

<h2>DAS OBRIGAÇÕES DO LOCADOR</h2>
<p>${landlordObligations}</p>

<h2>DAS OBRIGAÇÕES DO LOCATÁRIO</h2>
<p>${tenantObligations}</p>

<p>Pelos presentes termos e condições, as partes acordam com este contrato de aluguel.</p>

<p>Assinatura do Locador: __________________ Data: __________</p>
<p>Assinatura do Locatário: __________________ Data: __________</p>
</body>
</html>',
    'PT',
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

