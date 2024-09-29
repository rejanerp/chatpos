const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();

// Obter as chaves do CometChat das variáveis de ambiente
const appID = functions.config().cometchat.appid;
const apiKey = functions.config().cometchat.apikey;

// Função para criar usuário no CometChat quando um novo usuário é criado no Firebase Auth
exports.createCometChatUser = functions.auth.user().onCreate(async (user) => {
  const { secret: appID } = await functions.config().secrets.access('COMETCHAT_APP_ID');
  const { secret: apiKey } = await functions.config().secrets.access('COMETCHAT_API_KEY');

  const uid = user.uid;
  const name = user.displayName || user.email;

  try {
    await axios.post(
      'https://api-us.cometchat.io/v3/users',
      { uid, name },
      {
        headers: {
          appid: appID,
          apikey: apiKey,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Usuário criado no CometChat:', uid);
  } catch (error) {
    console.error(
      'Erro ao criar usuário no CometChat:',
      error.response ? error.response.data : error.message
    );
  }
});


// Função para gerar Auth Token do CometChat
exports.generateCometChatAuthToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'O usuário deve estar autenticado.');
  }

  const uid = context.auth.uid;

  try {
    const response = await axios.post(
      'https://api-us.cometchat.io/v3/auth_tokens',
      { uid },
      {
        headers: {
          appid: functions.config().cometchat.appid,
          apikey: functions.config().cometchat.apikey,
          'Content-Type': 'application/json',
        },
      }
    );

    const authToken = response.data.data.authToken;
    return { authToken };
  } catch (error) {
    console.error(
      'Erro ao gerar Auth Token do CometChat:',
      error.response ? error.response.data : error.message
    );
    throw new functions.https.HttpsError('internal', 'Não foi possível gerar o Auth Token.');
  }
});
