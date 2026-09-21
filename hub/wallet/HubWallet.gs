/**
 * João Barreto — Google Wallet Hub
 *
 * This file contains no credentials. Configure the Script Property
 * WALLET_SERVICE_ACCOUNT_JSON_B64 in a separate Google Apps Script project.
 */

var JOAO_HUB_WALLET = Object.freeze({
  issuerId: "3388000000023190786",
  classId: "3388000000023190786.joao_hub",
  objectId: "3388000000023190786.joao_barreto_hub",
  hubUrl: "https://barretomen.github.io/j/?src=wallet",
  apiBase: "https://walletobjects.googleapis.com/walletobjects/v1",
  tokenUrl: "https://oauth2.googleapis.com/token",
  scope: "https://www.googleapis.com/auth/wallet_object.issuer",
  propertyName: "WALLET_SERVICE_ACCOUNT_JSON_B64",
  photoUrl: "https://raw.githubusercontent.com/Barretomen/Barretomen.github.io/main/assets/wallet/joao_barreto_wallet_photo.jpg",
  heroUrl: "https://raw.githubusercontent.com/Barretomen/Barretomen.github.io/main/assets/wallet/joao_barreto_wallet_hero.png"
});

function hubWalletStatus() {
  var baseStatus = {
    serviceAccountConfigured: false,
    classId: JOAO_HUB_WALLET.classId,
    objectId: JOAO_HUB_WALLET.objectId,
    classApiStatus: null,
    objectApiStatus: null,
    state: null,
    barcodeType: null,
    barcodeConfigured: false,
    hubUrl: JOAO_HUB_WALLET.hubUrl
  };

  try {
    var serviceAccount = _hubWalletLoadServiceAccount();
    baseStatus.serviceAccountConfigured = true;
    var token = _hubWalletAccessToken(serviceAccount);
    var classResponse = _hubWalletRequest("get", "/genericClass/" + encodeURIComponent(JOAO_HUB_WALLET.classId), token);
    var objectResponse = _hubWalletRequest("get", "/genericObject/" + encodeURIComponent(JOAO_HUB_WALLET.objectId), token);

    baseStatus.classApiStatus = classResponse.status;
    baseStatus.objectApiStatus = objectResponse.status;

    if (objectResponse.status >= 200 && objectResponse.status < 300) {
      baseStatus.state = objectResponse.body.state || null;
      baseStatus.barcodeType = objectResponse.body.barcode ? objectResponse.body.barcode.type : null;
      baseStatus.barcodeConfigured = Boolean(
        objectResponse.body.barcode && objectResponse.body.barcode.value === JOAO_HUB_WALLET.hubUrl
      );
    }
  } catch (error) {
    baseStatus.error = _hubWalletSafeError(error);
  }

  console.log(JSON.stringify(baseStatus, null, 2));
  return baseStatus;
}

function createOrUpdateJoaoHubPass() {
  var serviceAccount = _hubWalletLoadServiceAccount();
  var token = _hubWalletAccessToken(serviceAccount);
  var passClass = _hubWalletClassResource();
  var passObject = _hubWalletObjectResource();

  var classLookup = _hubWalletRequest("get", "/genericClass/" + encodeURIComponent(JOAO_HUB_WALLET.classId), token);
  if (classLookup.status === 404) {
    var classCreate = _hubWalletRequest("post", "/genericClass", token, passClass);
    _hubWalletRequireSuccess(classCreate, "create GenericClass");
  } else {
    _hubWalletRequireSuccess(classLookup, "read GenericClass");
  }

  var objectLookup = _hubWalletRequest("get", "/genericObject/" + encodeURIComponent(JOAO_HUB_WALLET.objectId), token);
  var objectResponse;
  if (objectLookup.status === 404) {
    objectResponse = _hubWalletRequest("post", "/genericObject", token, passObject);
    _hubWalletRequireSuccess(objectResponse, "create GenericObject");
  } else {
    _hubWalletRequireSuccess(objectLookup, "read GenericObject");
    objectResponse = _hubWalletRequest(
      "patch",
      "/genericObject/" + encodeURIComponent(JOAO_HUB_WALLET.objectId),
      token,
      passObject
    );
    _hubWalletRequireSuccess(objectResponse, "update GenericObject");
  }

  var result = {
    ok: true,
    classId: JOAO_HUB_WALLET.classId,
    objectId: JOAO_HUB_WALLET.objectId,
    saveUrl: _hubWalletSaveUrl(serviceAccount),
    hubUrl: JOAO_HUB_WALLET.hubUrl
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}

function getJoaoHubSaveUrl() {
  var serviceAccount = _hubWalletLoadServiceAccount();
  var saveUrl = _hubWalletSaveUrl(serviceAccount);
  console.log("Save URL generated for " + JOAO_HUB_WALLET.objectId + ".");
  return saveUrl;
}

function hubWalletConfigGuide() {
  var guide = {
    projectName: "Joao Barreto - Google Wallet Hub",
    requiredScriptProperty: JOAO_HUB_WALLET.propertyName,
    instruction: "Copy the same property value from the existing working Wallet Apps Script project. Never place it in source code or GitHub.",
    firstFunction: "hubWalletStatus",
    createFunction: "createOrUpdateJoaoHubPass",
    hubUrl: JOAO_HUB_WALLET.hubUrl
  };
  console.log(JSON.stringify(guide, null, 2));
  return guide;
}

function _hubWalletClassResource() {
  return {
    id: JOAO_HUB_WALLET.classId
  };
}

function _hubWalletObjectResource() {
  return {
    id: JOAO_HUB_WALLET.objectId,
    classId: JOAO_HUB_WALLET.classId,
    state: "ACTIVE",
    genericType: "GENERIC_OTHER",
    cardTitle: _hubWalletLocalized("Joao Barreto"),
    subheader: _hubWalletLocalized("Digital Hub"),
    header: _hubWalletLocalized("Projects • Social • Contact"),
    logo: _hubWalletImage(JOAO_HUB_WALLET.photoUrl, "Photo of Joao Barreto"),
    heroImage: _hubWalletImage(JOAO_HUB_WALLET.heroUrl, "Joao Barreto digital identity artwork"),
    hexBackgroundColor: "#07111C",
    barcode: {
      type: "QR_CODE",
      value: JOAO_HUB_WALLET.hubUrl,
      alternateText: "Abrir João Hub"
    },
    textModulesData: [
      {
        id: "hub_intro",
        header: "Explore my digital hub",
        body: "Projects, social links and contact in one place."
      }
    ],
    linksModuleData: {
      uris: [
        { id: "hub", uri: JOAO_HUB_WALLET.hubUrl, description: "Abrir João Hub" },
        { id: "whatsapp", uri: "https://wa.me/351921176038", description: "WhatsApp" },
        { id: "github", uri: "https://github.com/Barretomen", description: "GitHub" },
        { id: "linkedin", uri: "https://www.linkedin.com/in/barretomendes/", description: "LinkedIn" },
        { id: "instagram", uri: "https://www.instagram.com/jaobm_/", description: "Instagram" },
        { id: "email", uri: "mailto:imjoaobarreto@gmail.com", description: "Email" }
      ]
    }
  };
}

function _hubWalletLocalized(value) {
  return {
    defaultValue: {
      language: "en-US",
      value: value
    }
  };
}

function _hubWalletImage(uri, description) {
  return {
    sourceUri: { uri: uri },
    contentDescription: _hubWalletLocalized(description)
  };
}

function _hubWalletLoadServiceAccount() {
  var encoded = PropertiesService.getScriptProperties().getProperty(JOAO_HUB_WALLET.propertyName);
  if (!encoded) {
    throw new Error("Missing Script Property: " + JOAO_HUB_WALLET.propertyName);
  }

  var decoded;
  try {
    decoded = Utilities.newBlob(Utilities.base64Decode(encoded)).getDataAsString("UTF-8");
  } catch (_standardBase64Error) {
    decoded = Utilities.newBlob(Utilities.base64DecodeWebSafe(encoded)).getDataAsString("UTF-8");
  }

  var serviceAccount;
  try {
    serviceAccount = JSON.parse(decoded);
  } catch (_parseError) {
    throw new Error(JOAO_HUB_WALLET.propertyName + " is not valid Base64-encoded JSON.");
  }

  if (!serviceAccount.client_email || !serviceAccount.private_key) {
    throw new Error("Service Account JSON must include client_email and private_key.");
  }
  return serviceAccount;
}

function _hubWalletAccessToken(serviceAccount) {
  var now = Math.floor(Date.now() / 1000);
  var assertion = _hubWalletSignJwt({
    iss: serviceAccount.client_email,
    scope: JOAO_HUB_WALLET.scope,
    aud: JOAO_HUB_WALLET.tokenUrl,
    iat: now,
    exp: now + 3600
  }, serviceAccount.private_key);

  var response = UrlFetchApp.fetch(JOAO_HUB_WALLET.tokenUrl, {
    method: "post",
    contentType: "application/x-www-form-urlencoded",
    payload: {
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: assertion
    },
    muteHttpExceptions: true
  });

  var status = response.getResponseCode();
  var body = _hubWalletParseJson(response.getContentText());
  if (status < 200 || status >= 300 || !body.access_token) {
    throw new Error("OAuth token request failed with HTTP " + status + ".");
  }
  return body.access_token;
}

function _hubWalletSaveUrl(serviceAccount) {
  var now = Math.floor(Date.now() / 1000);
  var token = _hubWalletSignJwt({
    iss: serviceAccount.client_email,
    aud: "google",
    typ: "savetowallet",
    iat: now,
    origins: [],
    payload: {
      genericObjects: [
        {
          id: JOAO_HUB_WALLET.objectId,
          classId: JOAO_HUB_WALLET.classId
        }
      ]
    }
  }, serviceAccount.private_key);
  return "https://pay.google.com/gp/v/save/" + token;
}

function _hubWalletSignJwt(claims, privateKey) {
  var header = { alg: "RS256", typ: "JWT" };
  var unsignedToken = _hubWalletBase64Url(JSON.stringify(header)) + "." + _hubWalletBase64Url(JSON.stringify(claims));
  var signature = Utilities.computeRsaSha256Signature(unsignedToken, privateKey);
  return unsignedToken + "." + Utilities.base64EncodeWebSafe(signature).replace(/=+$/g, "");
}

function _hubWalletBase64Url(value) {
  return Utilities.base64EncodeWebSafe(value, Utilities.Charset.UTF_8).replace(/=+$/g, "");
}

function _hubWalletRequest(method, path, token, payload) {
  var options = {
    method: method,
    headers: { Authorization: "Bearer " + token },
    muteHttpExceptions: true
  };
  if (payload !== undefined) {
    options.contentType = "application/json";
    options.payload = JSON.stringify(payload);
  }

  var response = UrlFetchApp.fetch(JOAO_HUB_WALLET.apiBase + path, options);
  var text = response.getContentText();
  return {
    status: response.getResponseCode(),
    body: _hubWalletParseJson(text)
  };
}

function _hubWalletRequireSuccess(response, action) {
  if (response.status < 200 || response.status >= 300) {
    var message = response.body && response.body.error && response.body.error.message
      ? response.body.error.message
      : "No public API error message returned";
    throw new Error("Unable to " + action + " (HTTP " + response.status + "): " + message);
  }
}

function _hubWalletParseJson(text) {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (_error) {
    return {};
  }
}

function _hubWalletSafeError(error) {
  var message = error && error.message ? String(error.message) : "Unknown Wallet error";
  return message.replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [REDACTED]");
}
