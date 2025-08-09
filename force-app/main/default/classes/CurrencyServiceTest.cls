@IsTest
private class CurrencyServiceTest {
    private class CurrencyMock implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(200);
            // formato do open.er-api.com
            res.setBody('{"result":"success","base_code":"USD","rates":{"BRL":5.12,"EUR":0.92,"GBP":0.78}}');
            return res;
        }
    }

    @IsTest static void testGetRates() {
        Test.setMock(HttpCalloutMock.class, new CurrencyMock());
        Test.startTest();
        Map<String, Decimal> rates = CurrencyService.getRates('USD');
        Test.stopTest();
        System.assertEquals(3, rates.size());
        System.assertEquals(5.12, rates.get('BRL'));
    }

    @IsTest static void testConvert() {
        Test.setMock(HttpCalloutMock.class, new CurrencyMock());
        Test.startTest();
        Decimal converted = CurrencyService.convert('USD','BRL', 10);
        Test.stopTest();
        System.assertEquals(51.2, converted);
    }
}
