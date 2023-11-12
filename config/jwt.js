const crypto = require('crypto');

class JWT {
  constructor(secret) {
    this.secret = secret;
  }

  encode(payload) {
    const header = this.encodeBase64({ alg: 'HS256', typ: 'JWT' });
    const body = this.encodeBase64(payload);
    const signature = this.sign(`${header}.${body}`);

    return `${header}.${body}.${signature}`;
  }

  decode(token) {
    const [header, body, signature] = token.split('.');
    const decodedHeader = this.decodeBase64(header);
    const decodedBody = this.decodeBase64(body);

    if (this.verifySignature(`${header}.${body}`, signature)) {
      return decodedBody;
      
    } else {
      throw new Error('Invalid token');
    }
  }

  encodeBase64(data) {
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  decodeBase64(data) {
    return JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
  }

  sign(data) {
    const hmac = crypto.createHmac('sha256', this.secret);
    hmac.update(data);
    return hmac.digest('base64');
  }

  verifySignature(data, signature) {
    const expectedSignature = this.sign(data);
    return signature === expectedSignature;
  }
}

module.exports = JWT;