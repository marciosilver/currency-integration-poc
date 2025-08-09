# Currency Integration PoC (Salesforce)

PoC de integração REST em Salesforce com **Named Credential + Apex + LWC**.
Consulta taxas de câmbio (API pública `open.er-api.com`), faz conversões,
suporta **conversão inversa** e formata valores usando o locale do usuário Salesforce.

## Stack
- Apex (HttpCallout via Named Credential)
- LWC (Lightning Web Components)
- Named Credential + External Credential (No Authentication)
- SFDX

## Como executar
1. Crie na org:
   - **External Credential**: `ExchangeRateExt` (No Authentication)
   - **Principal**: `AnonymousPrincipal` (mapeado em um Permission Set)
   - **Named Credential**: `ExchangeRate` → URL `https://open.er-api.com`
2. Faça o deploy:
   ```bash
   sfdx force:source:deploy -x manifest/package.xml -u <POCRest>