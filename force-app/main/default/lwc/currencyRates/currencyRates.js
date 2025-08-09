import { LightningElement } from 'lwc';
import getRates from '@salesforce/apex/CurrencyService.getRates';
import convert from '@salesforce/apex/CurrencyService.convert';
import USER_LOCALE from '@salesforce/i18n/locale';

export default class CurrencyRates extends LightningElement {
    base = 'USD';
    amount = 1;
    targetsRaw = 'BRL,EUR,GBP';
    inverse = false; // target -> base
    loading = false;
    _rows = [];

    // mostramos strings já formatadas (controle total do locale)
    columns = [
        { label: 'Currency', fieldName: 'code', type: 'text' },
        { label: 'Rate (per 1 base)', fieldName: 'rateFmt', type: 'text' },
        { label: 'Converted Amount', fieldName: 'convertedFmt', type: 'text' }
    ];

    get baseOptions() {
        return [
            { label: 'USD', value: 'USD' },
            { label: 'EUR', value: 'EUR' },
            { label: 'BRL', value: 'BRL' },
            { label: 'GBP', value: 'GBP' },
            { label: 'JPY', value: 'JPY' }
        ];
    }

    get rows() { return this._rows; }
    set rows(v) { this._rows = v || []; }

    get amountLabel() {
        return this.inverse
            ? 'Amount in target currency (each row)'
            : 'Amount in base currency';
    }

    // ---------- handlers
    handleBaseChange(e) { this.base = e.detail.value; }
    handleAmountChange(e) { this.amount = Number(e.detail.value || 0); }
    handleTargetsChange(e) { this.targetsRaw = e.detail.value; }
    handleInverseToggle(e) {
        this.inverse = e.detail.checked;
        if (this.rows.length) this.computeConverted();
    }

    // ---------- formatação (locale automático do usuário)
    fmtNumber(value, min = 2, max = 2) {
        return new Intl.NumberFormat(USER_LOCALE, {
            minimumFractionDigits: min,
            maximumFractionDigits: max
        }).format(Number(value));
    }

    fmtCurrency(value, currencyCode) {
        try {
            return new Intl.NumberFormat(USER_LOCALE, {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(Number(value));
        } catch (e) {
            // fallback
            return this.fmtNumber(value, 2, 2) + (currencyCode ? ` ${currencyCode}` : '');
        }
    }

    // ---------- fluxo principal
    async fetchRates() {
        this.loading = true;
        try {
            const rates = await getRates({ base: this.base });
            const targets = (this.targetsRaw || '')
                .split(',')
                .map(t => t.trim().toUpperCase())
                .filter(Boolean);

            const baseRows = targets
                .filter(t => rates[t])
                .map(t => ({ code: t, rate: Number(rates[t]) }));

            this.rows = baseRows;
            this.computeConverted(); // calcula e formata
        } catch (e) {
            // eslint-disable-next-line no-alert
            alert('Erro ao buscar taxas: ' + (e?.body?.message || e.message));
        } finally {
            this.loading = false;
        }
    }

    async computeConverted() {
        if (!this.rows.length) return;

        if (!this.inverse) {
            const updated = await Promise.all(this.rows.map(async r => {
                try {
                    const val = await convert({ base: this.base, target: r.code, amount: this.amount });
                    return { ...r, converted: Number(val) };
                } catch {
                    return { ...r, converted: null };
                }
            }));
            this._rows = updated;
        } else {
            // conversão inversa: quanto isso representa na BASE
            this._rows = this.rows.map(r => {
                const conv = r.rate ? (Number(this.amount) / Number(r.rate)) : null;
                return { ...r, converted: conv };
            });
        }

        this.reformatRows();
    }

    reformatRows() {
        this._rows = this._rows.map(r => {
            const rateFmt = this.fmtNumber(r.rate, 4, 6);
            const convertedCurrency = this.inverse ? this.base : r.code;
            const convertedFmt = r.converted == null ? '' : this.fmtCurrency(r.converted, convertedCurrency);
            return { ...r, rateFmt, convertedFmt };
        });
    }

    connectedCallback() {
        this.fetchRates();
    }
}