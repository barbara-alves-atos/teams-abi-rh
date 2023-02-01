const axios = require('axios');
const TeamsUser = require('./TeamsUser');


// module.exports = class SendFiles{
//   constructor() {
//   };

//    static async send(context, file, teamsUser) {
//     var axios_file = require('axios');
//     let url_file = await axios_file.get(file[0].content.downloadUrl, {responseType: 'arraybuffer'});
//     let base64File = Buffer.from(url_file.data).toString('base64');
//     const response = await api.post('/teams/', {"idUser": teamsUser.userId, "attachments": "true", "base64": base64File, "downloadUrl": file[0].content.downloadUrl, "file_name": file[0].name, "fileType": "txt/" + file[0].content.fileType, }, {headers: {
//       apiKey: 'cGFzc3dvcmQgZGEgYXBpIGRvIHRlYW1zIGRhIGJyYXNpbHByZXY='
//     }});
//     txtFromDf = response.data.text;
//       if(typeof txtFromDf == 'object') {
//         txtFromDf = txtFromDf[0]
//       };
//     if (txtFromDf.includes("Seu arquivo foi enviado com sucesso!\nSeu chamado pode demorar até 1 minuto para ser aberto, aguarde...")) {
//       dialogFlow_integration_buttons.getButton(context,txtFromDf);
//     }
//     else{
//       await context.sendActivity(
//         txtFromDf
//       );
//     }
//   };
// }
