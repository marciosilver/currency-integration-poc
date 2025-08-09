public with sharing class CurrencyService {
    private static final String NC = 'ExchangeRate';

    @AuraEnabled(cacheable=true)
    public static Map<String, Decimal> getRates(String base) {
        if (String.isBlank(base)) base = 'USD';
        HttpRequest req = new HttpRequest();
        // novo endpoint público
        req.setEndpoint('callout:' + NC + '/v6/latest/' + EncodingUtil.urlEncode(base, 'UTF-8'));
        req.setMethod('GET');
        req.setHeader('Accept', 'application/json');

        Http http = new Http();
        HttpResponse res = http.send(req);

        if (res.getStatusCode() != 200) {
            throw new AuraHandledException('Falha ao consultar taxas: ' + res.getStatus());
        }

        Map<String, Object> payload = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
        Object ratesAny = payload.get('rates');
        if (ratesAny == null) {
            throw new AuraHandledException('Resposta sem "rates".');
        }
        Map<String, Object> ratesObj = (Map<String, Object>) ratesAny;

        Map<String, Decimal> out = new Map<String, Decimal>();
        for (String k : ratesObj.keySet()) {
            Object v = ratesObj.get(k);
            if (v == null) continue;
            if (v instanceof Decimal) out.put(k, (Decimal) v);
            else if (v instanceof Integer) out.put(k, Decimal.valueOf((Integer) v));
            else if (v instanceof Long) out.put(k, Decimal.valueOf((Long) v));
            else if (v instanceof Double) out.put(k, Decimal.valueOf((Double) v));
        }
        return out;
    }

    @AuraEnabled(cacheable=true)
    public static Decimal convert(String base, String target, Decimal amount) {
        if (String.isBlank(target)) throw new AuraHandledException('Informe a moeda de destino.');
        if (amount == null) amount = 1;
        Map<String, Decimal> rates = getRates(base);
        Decimal rate = rates.get(target.toUpperCase());
        if (rate == null) throw new AuraHandledException('Moeda alvo não encontrada: ' + target);
        return amount * rate;
    }
}
