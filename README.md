# Currency Integration PoC (Salesforce)

PoC de integração REST em Salesforce com **Named Credential** + **Apex** + **LWC**.  
Consulta taxas de câmbio (API pública [open.er-api.com](https://open.er-api.com)), faz conversões, suporta conversão inversa e formata valores usando a **localização** do usuário Salesforce.

---

## 📸 Exemplo do LWC

![Currency Rates LWC](docs/lwc-example.png)

---

## 🔧 Stack

- **Apex** (HttpCallout via Named Credential)
- **LWC** (Lightning Web Components)
- **Named Credential** + **External Credential** (No Authentication)
- **SFDX**

---

## 🚀 Como executar

1. **Criar na org**:
   - **External Credential**: `ExchangeRateExt` (No Authentication)
   - **Principal**: `AnonymousPrincipal` (mapeado em um Permission Set)
   - **Named Credential**: `ExchangeRate` → URL `https://open.er-api.com`

2. **Fazer o deploy**:
   ```bash
   sf project deploy start
