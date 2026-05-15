const crypto = require('crypto');
const moment = require('moment');

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
}

function createPaymentUrl(params) {
  const {
    amount,
    orderInfo,
    orderType,
    returnUrl,
    ipAddr,
    orderId
  } = params;

  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = process.env.VNP_TMN_CODE;
  vnp_Params['vnp_Locale'] = 'vn';
  vnp_Params['vnp_CurrCode'] = 'VND';
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = orderInfo;
  vnp_Params['vnp_OrderType'] = orderType || 'other';
  vnp_Params['vnp_Amount'] = amount * 100;
  vnp_Params['vnp_ReturnUrl'] = returnUrl || process.env.VNP_RETURN_URL;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = moment().add(105, 'minutes').utcOffset(7).format('YYYYMMDDHHmmss');
  vnp_Params['vnp_ExpireDate'] = moment().add(120, 'minutes').utcOffset(7).format('YYYYMMDDHHmmss');

  vnp_Params = sortObject(vnp_Params);

  const querystring = require('qs');
  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac('sha512', process.env.VNP_HASH_SECRET);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  vnp_Params['vnp_SecureHash'] = signed;

  const vnpUrl = process.env.VNP_URL + '?' + querystring.stringify(vnp_Params, { encode: false });
  
  return vnpUrl;
}

function verifyReturnUrl(vnp_Params) {
  const secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  const sortedParams = sortObject(vnp_Params);

  const querystring = require('qs');
  const signData = querystring.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac('sha512', process.env.VNP_HASH_SECRET);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  return secureHash === signed;
}

module.exports = {
  createPaymentUrl,
  verifyReturnUrl
};
