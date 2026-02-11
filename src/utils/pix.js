
/*
  Pix Payload Generator (EMVCo Standard)
  Based on BCB Specifications
*/

const formatField = (id, value) => {
    const valStart = value.length < 10 ? `0${value.length}` : value.length;
    return `${id}${valStart}${value}`;
};

const crc16 = (payload) => {
    // CRC-16-CCITT-FALSE (Polynomial 0x1021, Initial 0xFFFF)
    let crc = 0xFFFF;
    const polynomial = 0x1021;

    for (let i = 0; i < payload.length; i++) {
        crc ^= payload.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = (crc << 1) ^ polynomial;
            } else {
                crc = crc << 1;
            }
        }
    }

    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
};

export class PixPayload {
    constructor({ key, name, city, value, txid = '***' }) {
        this.key = key;
        this.name = name; // Max 25 chars, reduced for safety
        this.city = city; // Max 15 chars
        this.value = value;
        this.txid = txid;
    }

    /*
      IDs:
      00 - Payload Format Indicator
      26 - Merchant Account Information (GUI + Key)
      52 - Merchant Category Code
      53 - Transaction Currency
      54 - Transaction Amount (Optional)
      58 - Country Code
      59 - Merchant Name
      60 - Merchant City
      62 - Additional Data Field (TxID)
      63 - CRC16
    */
    generate() {
        const payload = [
            formatField('00', '01'), // Format
            formatField('26', // Merchant Account
                formatField('00', 'BR.GOV.BCB.PIX') +
                formatField('01', this.key)
            ),
            formatField('52', '0000'), // MCC (General)
            formatField('53', '986'), // Currency (BRL)
        ];

        if (this.value) {
            payload.push(formatField('54', parseFloat(this.value).toFixed(2)));
        }

        payload.push(formatField('58', 'BR')); // Country
        payload.push(formatField('59', this.name.substring(0, 25).trim())); // Name
        payload.push(formatField('60', this.city.substring(0, 15).trim())); // City

        // Additional Data Field (TxID)
        payload.push(formatField('62',
            formatField('05', this.txid)
        ));

        payload.push('6304'); // CRC16 Header

        const payloadStr = payload.join('');
        const crc = crc16(payloadStr);

        return `${payloadStr}${crc}`;
    }
}
